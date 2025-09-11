import { ObjectId } from 'mongodb'

import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'

export const toyService = {
	remove,
	query,
	getById,
	add,
	update,
	addToyMsg,
	removeToyMsg,
}

async function query(filterBy = { txt: '' }) {
	// כאן אני צריך להעביר את זה לשפה של מונגו בכדי לשוח אותו ב"חכה" לבקשת שרת
	// את הפונקציה שתמיר את הפילטר אני עושה בסרויס של הצעצוע שם אני מנהל את השפה של מונגו גם 
	// אנחנו נעביר את כמות הדפים קדימה בכדי שנועל להשתמש בזה בפרונט 
	try {
		const criteria = {
			vendor: { $regex: filterBy.txt, $options: 'i' },
		}
		const collection = await dbService.getCollection('toy')
		// var toys = await collection.find(criteria).toArray()
		var toys = await collection.find({}).toArray()
		return toys
	} catch (err) {
		logger.error('cannot find toys', err)
		throw err
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
	// אנחנו בונים פה בעצם את האובייקט שנרצה לקבל. אני צריך לזכור שבשלב הזה כאילו אין לי 
	// ערכים של צעצעוים. אז אני צריך לבנות אותם בדרך.
	//  לדאוג שמשתמש שמוסיף יוסיף את הפרטים שלו כי זה חובה ומעבר לזה אני צריך להכניס את הנתונים הושים שמעניינים אותי.
	// גם כאן אנחנו רוצים להגן יש לנו את כל הנתונים המחייבים ואם לא לא לאפשר ליוזר לבצע את הפעולה!
	// בדוגמא של שרון הוא בעצם מפרק לכל הרכיבים שצריכים להיות באבייקט ועושה למה שלא מחייב 
	// =[] ואז מה שהוע עושה זה ממש לבנות אוביקט בשם הרצוי שלו מחדש 
	try {
		const collection = await dbService.getCollection('toy')
		await collection.insertOne(toy)
		return toy
	} catch (err) {
		logger.error('cannot insert toy', err)
		throw err
	}
}

async function update(toy) {
	// כאן אני גם מבצע עוב בדיקה כמו בקודם רק מוודא גם שיש תעודת זהות כי זה חייב להיות בפעולה מסוג זה. 
	// שרון מדגיש שזה יוטר עבודה דפנסיבית בבקאנד כי אנחנו רוצים לשמור שהוא לא יפול 
	// ולשמור על הדאטהץ תיד עדיף שנעשה עוד משהו קל לוודא שהמוצר שאנחנו עובדים אליו הוא מה שאנחנו מצפים 
	try {
		const toyToSave = {
			txt: toy.txt,
			price: toy.price,
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
		await collection.updateOne({ _id: ObjectId.createFromHexString(toyId) }, { $pull: { msgs: { id: msgId }}})
		return msgId
	} catch (err) {
		logger.error(`cannot add toy msg ${toyId}`, err)
		throw err
	}
}

