import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { Request, Response, NextFunction } from 'express';

// Ensure the directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 1. Check if the directory exists first.
    if (!fs.existsSync(uploadDir)) {
      // 2. If it doesn't, try to create it.
      fs.mkdir(uploadDir, (err) => {
        if (err) {
          // 3. If directory creation fails, pass the error to the callback.
          console.error('Failed to create upload directory:', err);
          return cb(err, '');
        }
        // 4. If directory is created successfully, pass null to the callback.
        cb(null, uploadDir);
      });
    } else {
      // 5. If directory already exists, proceed without error.
      cb(null, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    // Extract the original file extension
    const extname = path.extname(file.originalname);
    cb(null, Date.now() + '-' + file.fieldname + extname);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    console.log('file is: ', file);
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
