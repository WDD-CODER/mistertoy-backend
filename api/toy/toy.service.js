import { ObjectId } from 'mongodb'

import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'

const PAGE_SIZE = 4

export const toyService = {
	remove,
	query,
	getById,
	add,
	update,
	addToyMsg,
	removeToyMsg,
}

async function query(filterBy = { name: '' }) {
	try {
		const { filterCriteria, sortCriteria, skip } = _buildCriteria(filterBy)

		const collection = await dbService.getCollection('toy')
		const prmTotalCount = collection.countDocuments(filterCriteria)

		const prmFilteredToys = collection
			.find(filterCriteria, { sort: sortCriteria, skip, limit: PAGE_SIZE }).toArray()

		const [totalCount, filteredToys] = await Promise.all([prmTotalCount, prmFilteredToys])
		const maxPage = Math.ceil(totalCount / PAGE_SIZE)
		return { toys: filteredToys, maxPage }
	} catch (error) {
		logger.error('cannot find toys', error)
		throw error
	}
}

async function getById(toyId) {
	try {
		const collection = await dbService.getCollection('toy')
		const toy = await collection.findOne({ _id: ObjectId.createFromHexString(toyId) })
		toy.createdAt = toy._id.getTimestamp()
		return toy
	} catch (err) {
		logger.error(`while finding toy ${toyId}`, err)
		throw err
	}
}

async function remove(toyId) {
	try {
		const collection = await dbService.getCollection('toy')
		const { deletedCount } = await collection.deleteOne({ _id: ObjectId.createFromHexString(toyId) })
		return deletedCount
	} catch (err) {
		logger.error(`cannot remove toy ${toyId}`, err)
		throw err
	}
}

async function add(toy) {
	try {
		toy.createdAt = Date.now()
		toy.inStock = true
		const collection = await dbService.getCollection('toy')
		await collection.insertOne(toy)
		return toy
	} catch (err) {
		logger.error('cannot insert toy', err)
		throw err
	}
}

async function update(toy) {
	try {
		const { name, price, labels, inStock } = toy
		const toyToSave = {
			name,
			price,
			labels,
			inStock
		}
		const collection = await dbService.getCollection('toy')
		await collection.updateOne({ _id: ObjectId.createFromHexString(toy._id) }, { $set: toyToSave })
		return toy
	} catch (err) {
		logger.error(`cannot update toy ${toy._id}`, err)
		throw err
	}
}

async function addToyMsg(toyId, msg) {
	try {
		msg.id = utilService.makeId()

		const collection = await dbService.getCollection('toy')
		await collection.updateOne({ _id: ObjectId.createFromHexString(toyId) }, { $push: { msgs: msg } })
		return msg
	} catch (err) {
		logger.error(`cannot add toy msg ${toyId}`, err)
		throw err
	}
}

async function removeToyMsg(toyId, msgId) {
	try {
		const collection = await dbService.getCollection('toy')
		await collection.updateOne({ _id: ObjectId.createFromHexString(toyId) }, { $pull: { msgs: { id: msgId } } })
		return msgId
	} catch (err) {
		logger.error(`cannot add toy msg ${toyId}`, err)
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
