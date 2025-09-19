import { ObjectId } from 'mongodb'

import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'

const PAGE_SIZE = 4

export const reviewService = {
	remove,
	query,
	add,
}

async function query(filterBy = { name: '' }) {
	try {
		// const criteria = _buildCriteria(filterBy)

		const collection = await dbService.getCollection('review')

return collection
	} catch (error) {
		logger.error('cannot find reviews', error)
		throw error
	}
}

// async function getById(reviewId) {
// 	try {
// 		const collection = await dbService.getCollection('review')
// 		const review = await collection.findOne({ _id: ObjectId.createFromHexString(reviewId) })
// 		review.createdAt = review._id.getTimestamp()
// 		return review
// 	} catch (err) {
// 		logger.error(`while finding review ${reviewId}`, err)
// 		throw err
// 	}
// }

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
		const collection = await dbService.getCollection('review')
		await collection.insertOne(review)
		return review
	} catch (err) {
		logger.error('cannot insert review', err)
		throw err
	}
}

// async function update(review) {
// 	try {
// 		const { name, price, labels, inStock } = review
// 		const reviewToSave = {
// 			name,
// 			price,
// 			labels,
// 			inStock
// 		}
// 		const collection = await dbService.getCollection('review')
// 		await collection.updateOne({ _id: ObjectId.createFromHexString(review._id) }, { $set: reviewToSave })
// 		return review
// 	} catch (err) {
// 		logger.error(`cannot update review ${review._id}`, err)
// 		throw err
// 	}
// }


function _buildCriteria(filterBy) {
	const criteria = {}

	// if (filterBy.userId) {
	// 	filterCriteria.name = { $regex: filterBy.name, $options: 'i' }
	// }

	return criteria
}
