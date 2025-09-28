import express from 'express';

// Import controllers from
import { getAllUsers, updateUser } from '../controller/console';

// Setup router
const router = express.Router();

/**
 * @description Get all the users in database.
 * @route /api/console/users
 * @method GET
 */
router.get('/users', getAllUsers);

/**
 * @description Update a user in database.
 * @route /api/console/users
 * @method PUT
 */
router.put('/users', updateUser);

// Export router; should always export as default
export const consoleRouter = router;
