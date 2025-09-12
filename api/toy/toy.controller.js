import { toyService } from './toy.service.js'
import { logger } from '../../services/logger.service.js'

export async function getToys(req, res) {
    try {
        const filterBy = {
            name: req.query.name || '',
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
    const toy = req.body
    if (toy.name) {
        
    }
    // פה אני צריך לפרק את הצעצוע בלבד! זה שומר על בטיחות שלא אקבל מכונית והוא יחשוב שזה צעצוע
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

    const { name, price, labels, inStock, color, sales } = req.body
    const toy = { name, price, labels, inStock, color, sales }
    // פה אני צריך לפרק את הצעצוע בלבד! זה שומר על בטיחות שלא אקבל מכונית והוא יחשוב שזה צעצוע
    try {
        const updatedToy = await toyService.update(toy)
        res.json(updatedToy)
    } catch (err) {
        logger.error('Failed to update toy', err)
        res.status(500).send({ err: 'Failed to update toy' })
    }
}

export async function removeToy(req, res) {
    console.log("🚀 ~ removeToy ~ removeToy:")
    // פה אני צריך לפרק את הצעצוע בלבד! זה שומר על בטיחות שלא אקבל מכונית והוא יחשוב שזה צעצוע

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
    const { loggedinUser } = req
    // אנחנו לא נרצה להעביר את כל המידע של היוזר בהודעה אנחנו נרצה רק להעביר מיני יוזר עם מידע רלוונטי בלבד
    try {
        const toyId = req.params.id
        const msg = {
            name: req.body.name,
            by: loggedinUser,
            createdAt: Date.now(),
        }
        const savedMsg = await toyService.addToyMsg(toyId, msg)
        res.json(savedMsg)
    } catch (err) {
        logger.error('Failed to update toy', err)
        res.status(500).send({ err: 'Failed to update toy' })
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