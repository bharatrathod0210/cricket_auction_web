const multer = require('multer');
const path = require('path');

// Try to use Cloudinary if credentials are available, otherwise use memory storage
let storage;
let useCloudinary = false;

try {
    // Check if all Cloudinary credentials are present
    const hasCloudinaryCredentials = 
        process.env.CLOUDINARY_CLOUD_NAME && 
        process.env.CLOUDINARY_API_KEY && 
        process.env.CLOUDINARY_API_SECRET;

    if (hasCloudinaryCredentials) {
        const cloudinary = require('cloudinary').v2;
        const { CloudinaryStorage } = require('multer-storage-cloudinary');

        // Configure Cloudinary
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        // Cloudinary storage
        storage = new CloudinaryStorage({
            cloudinary: cloudinary,
            params: async (req, file) => {
                let folder = 'rpl/general';
                
                if (file.fieldname === 'playerPhoto') {
                    folder = 'rpl/players';
                } else if (file.fieldname === 'paymentScreenshot') {
                    folder = 'rpl/payments';
                } else if (file.fieldname === 'logo') {
                    folder = 'rpl/teams';
                } else if (file.fieldname === 'image') {
                    folder = 'rpl/players';
                }
                
                return {
                    folder: folder,
                    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff'],
                    resource_type: 'auto',
                    transformation: [{ width: 1000, height: 1000, crop: 'limit', quality: 'auto' }]
                };
            }
        });
        
        useCloudinary = true;
        console.log('✅ Cloudinary storage configured successfully');
    } else {
        throw new Error('Cloudinary credentials missing. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to environment variables.');
    }
} catch (error) {
    console.error('❌ Cloudinary configuration failed:', error.message);
    console.error('⚠️ WARNING: Using memory storage. File uploads will NOT persist on Vercel!');
    console.error('⚠️ Please configure Cloudinary credentials in Vercel environment variables.');
    
    // Fallback to memory storage (won't work on Vercel but prevents crashes)
    storage = multer.memoryStorage();
}

const fileFilter = (req, file, cb) => {
    // Accept all common image formats
    const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp',
        'image/bmp',
        'image/tiff'
    ];
    
    const allowedExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|tiff)$/i;
    
    const hasValidMimeType = allowedMimeTypes.includes(file.mimetype);
    const hasValidExtension = allowedExtensions.test(file.originalname);
    
    if (hasValidMimeType || hasValidExtension) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type. Allowed: JPG, PNG, GIF, WEBP. Received: ${file.mimetype}`), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter
});

module.exports = upload;
module.exports.useCloudinary = useCloudinary;
