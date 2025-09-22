import express from 'express';

// Import controllers from
import {
  login,
  logout,
  recoverAccount,
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


router.post('/change-password', register);

router.post('/recovery', recoverAccount);

// Route to validate verify link
router.get('/validate-link', validateVerifyToken);

// Route to resend verification link
router.get('/resend-link', resendVerificationLink);

// Route to authenticate session
router.get('/validate-session', validateSession);

router.get('/username', usernameAvailability);

// Export router; should always export as default
export const authRouter = router;
