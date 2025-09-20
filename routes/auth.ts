import express from 'express';

// Import controllers from
import {
  login,
  logout,
  register,
  resendVerificationLink,
  usernameAvailability,
  validateVerifyToken,
} from '../controller/auth';
import { validateSession } from '../middleware/auth-middleware';

// Setup router
const router = express.Router();

// Setup all routes for user
router.post('/login', login);

// Logout the user
router.get('/logout', logout);

// Setup all routes for user
router.post('/register', register);

// Route to validate verify link
router.get('/validate-link', validateVerifyToken);

// Route to resend verification link
router.get('/resend-link', resendVerificationLink);

// Route to authenticate session
router.get('/validate-session', validateSession);

router.get('/username', usernameAvailability);

// Export router; should always export as default
export const authRouter = router;
