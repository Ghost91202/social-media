import multer from 'multer';

// Set up Multer storage
const storage = multer.memoryStorage(); // Store files in memory buffer

// Define the fields that multer should handle
const upload = multer({ storage }).fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'coverPhoto', maxCount: 1 },
]);

export default upload;
