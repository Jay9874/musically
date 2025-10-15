import express from 'express';

// Import controllers from
import {
  albumDetails,
  getAllAlbums,
  loadAlbum,
  loadSong,
} from '../controller/music';

// Setup router
const router = express.Router();

/**
 * @description Get all the albums.
 * @route /api/music/albums;
 * @method GET
 */
router.get('/albums', getAllAlbums);

/**
 * @description Load the player with song id.
 * @route /api/music/song;
 * @method GET
 */
router.get('/song', loadSong);

/**
 * @description Get album details with id.
 * @route /api/music/album/:id;
 * @method GET
 */
router.get('/album/:id', albumDetails);

/**
 * @description Load a album with its songs.
 * @route /api/music/load/album/:id;
 * @method GET
 */
router.get('/load/album/:id', loadAlbum);

// Export router; should always export as default
export const musicRouter = router;
