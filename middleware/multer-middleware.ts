import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { Request, Response, NextFunction } from 'express';

const storage = multer.memoryStorage()

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Define allowed file types and their max sizes in bytes
    const allowedTypes: { [type: string]: number } = {
      image: 0.2 * 1024 * 1024, // 0.2 MB for images
    };

    const indexOfSlash = file.mimetype.indexOf('/');
    const fileType: string = file.mimetype.slice(0, indexOfSlash);
    const maxSize: number = allowedTypes[fileType];

    // if song and image files types are not valid return error
    if (file.fieldname === 'song' && fileType !== 'audio') {
      return cb(new Error(`The file uploaded as song is not valid.`));
    }
    if (file.fieldname === 'thumbnail' && fileType !== 'image') {
      return cb(new Error(`The file uploaded as thumbnail is not valid.`));
    }
    if (maxSize && file.size > maxSize) {
      // Reject the file with a custom error message
      return cb(
        new Error(
          `Thumbnail size is too large. Max allowed: ${
            maxSize / (1024 * 1024)
          }MB.`
        )
      );
    }
    // 3. Accept the file
    cb(null, true);
  },
});

export const uploadMultiple = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'song', maxCount: 1 },
  ])(req, res, (err) => {
    if (err) {
      console.log('err while upload: ', err);
      next(err);
    } else next();
  });
};
