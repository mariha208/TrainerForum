'use strict';

const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

// Configure Cloudinary using .env credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file buffer to Cloudinary and returns its permanent public URL.
 * @param {Buffer} fileBuffer  - The raw binary file data
 * @param {string} mimeType    - e.g. 'image/jpeg', 'image/png'
 * @param {string} fileName    - Used as the public_id in Cloudinary
 * @param {string} imageType   - 'profile' or 'banner' (used for folder organisation)
 * @returns {Promise<string>}  - The permanent, CDN-hosted public URL
 */
function uploadFileToCloudinary(fileBuffer, mimeType, fileName, imageType) {
  return new Promise((resolve, reject) => {
    const folder = `trainer-forum/${imageType}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder:           folder,
        public_id:        fileName.replace(/\.[^/.]+$/, ''), // strip file extension
        resource_type:    'image',
        overwrite:        true,
        transformation:   [{ quality: 'auto', fetch_format: 'auto' }], // auto-optimise
      },
      (error, result) => {
        if (error) {
          console.error('[Cloudinary] Upload error:', error.message);
          return reject(new Error(error.message));
        }
        console.log(`[Cloudinary] Uploaded "${fileName}" → ${result.secure_url}`);
        resolve(result.secure_url);
      }
    );

    // Pipe the buffer into the upload stream
    const readable = Readable.from(fileBuffer);
    readable.pipe(uploadStream);
  });
}

module.exports = { uploadFileToCloudinary };
