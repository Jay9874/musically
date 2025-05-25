import express from 'express';

// Import controllers from
import { login, register } from '../controller/auth';

// Setup router
const router = express.Router();

// Setup all routes for user
router.post('/login', login);

// Setup all routes for user
router.post('/register', register);

// Export router; should always export as default
export const authRouter = router;
