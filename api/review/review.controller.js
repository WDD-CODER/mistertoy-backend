import { reviewService } from './review.service.js'
import { logger } from '../../services/logger.service.js'
import { toyService } from "../toy/toy.service.js";
import { socketService } from '../../services/socket.service.js';

export async function getReviews(req, res) {
    try {
        const reviews = await reviewService.query(req.query)
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

    const { loggedinUser } = req

    try {
        var review = req.body
        const { aboutToyId } = review
        review.byUserId = loggedinUser._id
        review = await reviewService.add(review)
        review.byUser = loggedinUser
        review.aboutToy = await toyService.getById(aboutToyId)
        review.createdAt = review._id.getTimestamp()

        delete review.aboutToyId
        delete review.byUserId

        socketService.broadcast({type:'review-added', data:review, userId: loggedinUser._id })
        socketService.emitTo({type:'review-about-you', data:review, userId:review.aboutToy})


        if (!loggedinUser || !aboutToyId || !review.txt) return res.status(400).send('Missing data')

        res.send(review)
        console.log(`${review.byUser.fullname}'s Review added`)

    } catch (err) {
        logger.error('Failed to add review', err)
        res.status(500).send({ err: 'Failed to add review' })
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


