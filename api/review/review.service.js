import { ObjectId } from 'mongodb'

import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'

const PAGE_SIZE = 4

export const reviewService = {
	remove,
	query,
	getById,
	add,
	update,
	addReviewMsg,
	removeReviewMsg,
}

async function query(filterBy = { name: '' }) {
	try {
		const { filterCriteria, sortCriteria, skip } = _buildCriteria(filterBy)

		const collection = await dbService.getCollection('review')
		const prmTotalCount = collection.countDocuments(filterCriteria)

		const prmFilteredReviews = collection
			.find(filterCriteria, { sort: sortCriteria, skip, limit: PAGE_SIZE }).toArray()

		const [totalCount, filteredReviews] = await Promise.all([prmTotalCount, prmFilteredReviews])
		const maxPage = Math.ceil(totalCount / PAGE_SIZE)
		return { reviews: filteredReviews, maxPage }
	} catch (error) {
		logger.error('cannot find reviews', error)
		throw error
	}
}

async function getById(reviewId) {
	try {
		const collection = await dbService.getCollection('review')
		const review = await collection.findOne({ _id: ObjectId.createFromHexString(reviewId) })
		review.createdAt = review._id.getTimestamp()
		return review
	} catch (err) {
		logger.error(`while finding review ${reviewId}`, err)
		throw err
	}
}

async function remove(reviewId) {
	try {
		const collection = await dbService.getCollection('review')
		const { deletedCount } = await collection.deleteOne({ _id: ObjectId.createFromHexString(reviewId) })
		return deletedCount
	} catch (err) {
		logger.error(`cannot remove review ${reviewId}`, err)
		throw err
	}
}

async function add(review) {
	try {
		review.createdAt = Date.now()
	//FIXME רק לוודא שזה כבר לא הכרחי.	// review.inStock = true
		const collection = await dbService.getCollection('review')
		await collection.insertOne(review)
		return review
	} catch (err) {
		logger.error('cannot insert review', err)
		throw err
	}
}

async function update(review) {
	try {
		const { name, price, labels, inStock } = review
		const reviewToSave = {
			name,
			price,
			labels,
			inStock
		}
		const collection = await dbService.getCollection('review')
		await collection.updateOne({ _id: ObjectId.createFromHexString(review._id) }, { $set: reviewToSave })
		return review
	} catch (err) {
		logger.error(`cannot update review ${review._id}`, err)
		throw err
	}
}

async function addReviewMsg(reviewId, msg) {
	try {
		msg.id = utilService.makeId()
		const collection = await dbService.getCollection('review')
		await collection.updateOne({ _id: ObjectId.createFromHexString(reviewId) }, { $push: { msgs: msg } })
		return msg
	} catch (err) {
		logger.error(`cannot add review msg ${reviewId}`, err)
		throw err
	}
}

async function removeReviewMsg(reviewId, msgId) {
	try {
		const collection = await dbService.getCollection('review')
		await collection.updateOne({ _id: ObjectId.createFromHexString(reviewId) }, { $pull: { msgs: { id: msgId } } })
		return msgId
	} catch (err) {
		logger.error(`cannot add review msg ${reviewId}`, err)
		throw err
	}
}

function _buildCriteria(filterBy) {

	var filterCriteria = {}

	if (filterBy.name) {
		filterCriteria.name = { $regex: filterBy.name, $options: 'i' }
	}

	if (filterBy.inStock) {
		filterCriteria.inStock = JSON.parse(filterBy.inStock)
	}

	if (filterBy.labels && filterBy.labels.length) {
		filterCriteria.labels = { $all: filterBy.labels }
	}

	if (filterBy.price) {
		filterCriteria.price = { $gte: filterBy.price }
	}

	const sortCriteria = {}

	if (filterBy.sortBy) {
		sortCriteria[filterBy.sortBy] = filterBy.sortDir || 1;
	} else {
		sortCriteria.createdAt = -1;
	}

	const skip = filterBy.pageIdx !== undefined ? filterBy.pageIdx * PAGE_SIZE : 0

	return { filterCriteria, sortCriteria, skip }
}
