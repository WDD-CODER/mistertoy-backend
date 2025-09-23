import { logger } from '../services/logger.service.js'
import { authService } from '../api/auth/auth.service.js'
import { asyncLocalStorage } from '../services/als.service.js'

export async function requireAuth(req, res, next) {

    const { loggedinUser } = asyncLocalStorage.getStore()
    if (!loggedinUser) return res.status(401).send('Not Authenticated')

    req.loggedinUser = loggedinUser

    next()
}

export async function requireAdmin(req, res, next) {
    const { loggedinUser } = asyncLocalStorage.getStore()
    if (!loggedinUser?.isAdmin) {
        logger.warn(loggedinUser.fullname + 'attempted to perform admin action')
        return res.status(403).end('Not Authorized')
    }
    req.loggedinUser = loggedinUser
    next()
}