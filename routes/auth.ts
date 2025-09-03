import express from 'express';

// Import controllers from
import { login, register, validateVerifyToken } from '../controller/auth';

// Setup router
const router = express.Router();

// Setup all routes for user
router.post('/login', login);

// Setup all routes for user
router.post('/register', register);

// Route to validate verify link
router.get('/validate-link', validateVerifyToken);

// Export router; should always export as default
export const authRouter = router;
