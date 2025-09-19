import express from 'express'
import { requireAuth, requireAdmin } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'
import { getReviews, getReviewById, addReview, updateReview, removeReview, addReviewMsg, removeReviewMsg } from './review.controller.js'

export const reviewRoutes = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

reviewRoutes.get('/', log, getReviews)
reviewRoutes.get('/:id', getReviewById)
//TODO להוסיף פה בקשה מיוחדת לקבל את הלייבלים בלבד! מכל הצעצעועים
reviewRoutes.post('/', requireAuth, addReview)
reviewRoutes.put('/:id', requireAuth, updateReview)
reviewRoutes.delete('/:id', requireAuth, removeReview)

// reviewRoutes.post('/:id/msg', addReviewMsg)
reviewRoutes.post('/:id/msg', requireAuth, addReviewMsg)
// reviewRoutes.delete('/:id/msg/:msgId', requireAuth, removeReviewMsg)

