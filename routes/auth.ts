import express from 'express';

// Import controllers from
import {
  changePassword,
  changeUsername,
  login,
  logout,
  recoverAccount,
  register,
  resendVerificationLink,
  usernameAvailability,
  validateVerifyToken,
} from '../controller/auth';
import { authenticate, validateSession } from '../middleware/auth-middleware';

// Setup router
const router = express.Router();

// Setup all routes for user
router.post('/login', login);

// Logout the user
router.get('/logout', authenticate, logout);

// Setup all routes for user
router.post('/register', register);

router.post('/change-password', authenticate, changePassword);

router.post('/recovery', recoverAccount);

// Route to validate verify link
router.get('/validate-link', validateVerifyToken);

// Route to resend verification link
router.get('/resend-link', resendVerificationLink);

// Route to authenticate session
router.get('/validate-session', validateSession);

router.get('/username', usernameAvailability);
/**
 * @description Change the username for logged user.
 * @route /api/auth/username
 * @method PUT
 */
router.put('/username', authenticate, changeUsername);

// Export router; should always export as default
export const authRouter = router;
