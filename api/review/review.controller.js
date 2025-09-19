import { reviewService } from './review.service.js'
import { logger } from '../../services/logger.service.js'

export async function getReviews(req, res) {

    try {
        // const {_id, userId, reviewId, txt } = req.query

        const filterBy = {
            userId: userId || '',
            reviewId: reviewId || '',
            txt: inStock || '',
            // labels: labels || [],
            // sortBy: sortBy,
            // pageIdx: +pageIdx || 0,
            // sortDir: (sortDir === 'false') ? -1 : 1
        }

        const reviews = await reviewService.query(filterBy)
        res.json(reviews)
    } catch (err) {
        logger.error('Failed to get reviews', err)
        res.status(500).send({ err: 'Failed to get reviews' })
    }
}

export async function getReviewById(req, res) {
    try {
        const reviewId = req.params.id
        const review = await reviewService.getById(reviewId)
        res.json(review)
    } catch (err) {
        logger.error('Failed to get review', err)
        res.status(500).send({ err: 'Failed to get review' })
    }
}

export async function addReview(req, res) {


    const { name, price, labels = [], inStock = true, color, sales = [] } = req.body
    //QUESTION במקרה הזה ההגנה עובדת אם אין שם אבל אני לא מקבל אינפורמציה לגבי מה קרה בפועל. איך אני דואג להעביר את המידע הזה?
    if (!name || !price) return res.status(400).send('Missing data')
    const review = { name, price, labels, inStock, color, sales }

    try {
        review.owner = loggedinUser
        const addedReview = await reviewService.add(review)
        res.json(addedReview)
    } catch (err) {
        logger.error('Failed to add review', err)
        res.status(500).send({ err: 'Failed to add review' })
    }
}

export async function updateReview(req, res) {
    const { name, price, labels = [], inStock = true, color, sales = [], _id } = req.body
    if (!name || !price || !_id) res.status(400).send('Missing data')
    const review = { name, price, labels, inStock, color, sales, _id }
    try {
        const updatedReview = await reviewService.update(review)
        res.json(updatedReview)
    } catch (err) {
        logger.error('Failed to update review', err)
        res.status(500).send({ err: 'Failed to update review' })
    }
}

export async function removeReview(req, res) {

    try {
        const reviewId = req.params.id
        const deletedCount = await reviewService.remove(reviewId)
        res.send(`${deletedCount} reviews removed`)
    } catch (err) {
        logger.error('Failed to remove review', err)
        res.status(500).send({ err: 'Failed to remove review' })
    }
}

export async function addReviewMsg(req, res) {
    // אנחנו לא נרצה להעביר את כל המידע של היוזר בהודעה אנחנו נרצה רק להעביר מיני יוזר עם מידע רלוונטי בלבד
    try {
        const reviewId = req.params.id
        const msg = {
            txt: req.body.txt,
            by: loggedinUser,
            createdAt: Date.now(),
        }
        const savedMsg = await reviewService.addReviewMsg(reviewId, msg)
        console.log(`Add message ${savedMsg.id} to review.`)

        res.json(savedMsg)
    } catch (err) {
        logger.error('Failed to Add Msg To Review', err)
        res.status(500).send({ err: 'Failed to Add Msg To Review' })
    }
}

export async function removeReviewMsg(req, res) {
   
    try {
        const { id: reviewId, msgId } = req.params

        const removedId = await reviewService.removeReviewMsg(reviewId, msgId)
        res.send(removedId)
    } catch (err) {
        logger.error('Failed to remove review msg', err)
        res.status(500).send({ err: 'Failed to remove review msg' })
    }
}