import { ObjectId } from 'mongodb'

import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'

const PAGE_SIZE = 4

export const reviewService = {
	remove,
	query,
	add,
}

async function query(filterBy = {}) {
	try {
		const { loggedinUser } = asyncLocalStorage.getStore()
		filterBy.byUserId = loggedinUser._id
		const criteria = _buildCriteria(filterBy)
		const collection = await dbService.getCollection('review')
		var reviewsCurser = await collection.aggregate([
			{ $match: criteria }
			,
			{
				$lookup: {
					from: 'toy',
					foreignField: '_id',
					localField: 'aboutToyId',
					as: 'Toy',
					pipeline: [
						// { $set: { _id: '$_id' } },
						// { $unset: ['_id'] }
					]

				}
			},
			{ $unwind: '$Toy' },
			{
				$lookup: {
					from: 'user',
					foreignField: '_id',
					localField: 'byUserId',
					as: 'byUser',
					pipeline: [
						// { $set: { 'userId': '$_id' } },
						{ $unset: ['password'] }

					]
				}
			},
			{ $set: { user: { $arrayElemAt: ["$byUser", 0] } } },
			{ $unset: ['byUser'] },
			{
				$project: {
					byUserId: 0,
					aboutToyId: 0,
					'Toy.labels': 0,
					'Toy.createdAt': 0,
					'Toy.msgs': 0,
					// 'Toy.price': 0,
					'Toy.inStock': 0,
					'Toy.color': 0,
					'Toy.sales': 0,
					'Toy.owner': 0,
					'user.username': 0,
					'user.isAdmin': 0,
				}
			},

		])

		const reviews = reviewsCurser.toArray()
		return reviews
	} catch (error) {
		logger.error('cannot find reviews', error)
		throw error
	}
}

async function remove(reviewId) {

	try {
		const { loggedinUser } = asyncLocalStorage.getStore()

		const collection = await dbService.getCollection('review')
		const criteria = { _id: ObjectId.createFromHexString(reviewId) }

		if (!loggedinUser.isAdmin) {
			criteria.byUserId = ObjectId.createFromHexString(loggedinUser._id)
			console.log('user Is Not Admin!')

		}

		const { deletedCount } = await collection.deleteOne(criteria)

		return deletedCount
	} catch (err) {
		logger.error(`cannot remove review ${reviewId}`, err)
		throw err
	}
}

async function add(review) {

	try {
		const reviewToAdd = {
			byUserId: ObjectId.createFromHexString(review.byUserId),
			aboutToyId: ObjectId.createFromHexString(review.aboutToyId),
			txt: review.txt,
		}

		const collection = await dbService.getCollection('review')
		await collection.insertOne(reviewToAdd)
		return reviewToAdd
	} catch (err) {
		logger.error('cannot insert review', err)
		throw err
	}
}


function _buildCriteria(filterBy) {
	const criteria = {}

	if (filterBy.byUserId) {
		criteria.byUserId = ObjectId.createFromHexString(filterBy.byUserId)
	}

	return criteria
}
