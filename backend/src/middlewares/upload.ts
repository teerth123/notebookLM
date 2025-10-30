import multer from 'multer';

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB || '5')) * 1024 * 1024, // 5MB default
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        console.log("here")
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});
