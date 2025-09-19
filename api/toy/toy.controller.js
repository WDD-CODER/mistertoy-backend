import { toyService } from './toy.service.js'
import { logger } from '../../services/logger.service.js'

export async function getToys(req, res) {

    try {
        const { name, price, labels, inStock, sortBy, pageIdx, sortDir } = req.query

        const filterBy = {
            name: name || '',
            price: +price || 0,
            inStock: inStock || '',
            labels: labels || [],
            sortBy: sortBy,
            pageIdx: +pageIdx || 0,
            sortDir: (sortDir === 'false') ? -1 : 1
        }

        const toys = await toyService.query(filterBy)
        res.json(toys)
    } catch (err) {
        logger.error('Failed to get toys', err)
        res.status(500).send({ err: 'Failed to get toys' })
    }
}

export async function getToyById(req, res) {
    try {
        const toyId = req.params.id
        const toy = await toyService.getById(toyId)
        res.json(toy)
    } catch (err) {
        logger.error('Failed to get toy', err)
        res.status(500).send({ err: 'Failed to get toy' })
    }
}

export async function addToy(req, res) {
    const { loggedinUser } = req

    const { name, price, labels = [], inStock = true, color, sales = [] } = req.body
    //QUESTION במקרה הזה ההגנה עובדת אם אין שם אבל אני לא מקבל אינפורמציה לגבי מה קרה בפועל. איך אני דואג להעביר את המידע הזה?
    if (!name || !price) return res.status(400).send('Missing data')
    const toy = { name, price, labels, inStock, color, sales }

    try {
        toy.owner = loggedinUser
        const addedToy = await toyService.add(toy)
        res.json(addedToy)
    } catch (err) {
        logger.error('Failed to add toy', err)
        res.status(500).send({ err: 'Failed to add toy' })
    }
}

export async function updateToy(req, res) {
    const { name, price, labels = [], inStock = true, color, sales = [], _id } = req.body
    if (!name || !price || !_id) res.status(400).send('Missing data')
    const toy = { name, price, labels, inStock, color, sales, _id }
    try {
        const updatedToy = await toyService.update(toy)
        res.json(updatedToy)
    } catch (err) {
        logger.error('Failed to update toy', err)
        res.status(500).send({ err: 'Failed to update toy' })
    }
}

export async function removeToy(req, res) {

    try {
        const toyId = req.params.id        
        const deletedCount = await toyService.remove(toyId)
        res.send(`${deletedCount} toys removed`)
    } catch (err) {
        logger.error('Failed to remove toy', err)
        res.status(500).send({ err: 'Failed to remove toy' })
    }
}

export async function addToyMsg(req, res) {
    console.log("🚀 ~ addToyMsg ~ addToyMsg:")
    const { loggedinUser } = req
    // אנחנו לא נרצה להעביר את כל המידע של היוזר בהודעה אנחנו נרצה רק להעביר מיני יוזר עם מידע רלוונטי בלבד
    try {
        console.log("🚀 ~ addToyMsg ~ req.body:", req.body)
        const toyId = req.params.id
        const msg = {
            txt: req.body.txt,
            by: loggedinUser,
            createdAt: Date.now(),
        }
        const savedMsg = await toyService.addToyMsg(toyId, msg)
        console.log(`Add message ${savedMsg.id} to toy.`)
        
        res.json(savedMsg)
    } catch (err) {
        logger.error('Failed to Add Msg To Toy', err)
        res.status(500).send({ err: 'Failed to Add Msg To Toy' })
    }
}

export async function removeToyMsg(req, res) {
    // const { loggedinUser } = req
    try {
        // const toyId = req.params.id
        // const { msgId } = req.params
        const { id: toyId, msgId } = req.params

        const removedId = await toyService.removeToyMsg(toyId, msgId)
        res.send(removedId)
    } catch (err) {
        logger.error('Failed to remove toy msg', err)
        res.status(500).send({ err: 'Failed to remove toy msg' })
    }
}