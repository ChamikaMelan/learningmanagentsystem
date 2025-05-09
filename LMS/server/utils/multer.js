import multer from "multer";

const upload = multer({dest:"uploads/"});
export default upload
export const uploadPDF = multer({
    storage: multer.diskStorage({
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `pdf_${uniqueSuffix}${path.extname(file.originalname)}`);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Only PDF files are allowed'), false);
      }
    },
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB limit (optional)
    }
  });