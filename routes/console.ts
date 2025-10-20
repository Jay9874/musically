import express from 'express';

// Import controllers from
import {
  getAllUsers,
  relatedData,
  updateUser,
  uploadSong,
} from '../controller/console';
import { uploadMultiple } from '../middleware/multer-middleware';

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

/**
 * @description Update a song.
 * @route /api/console/song/upload
 * @method POST
 */
router.post('/song/upload', uploadMultiple, uploadSong);

/**
 * @description User related albums.
 * @route /api/console/related-data
 * @method GET
 */
router.get('/related-data', relatedData);

/**
 * @description Upload song to album.
 * @route /api/console/upload
 * @method POST
 */
router.post('/upload', relatedData);

// Export router; should always export as default
export const consoleRouter = router;
