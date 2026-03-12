const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
    api_key: process.env.CLOUDINARY_API_KEY || 'demo',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'demo'
});

console.log('Cloudinary configured:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Not set',
    api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set',
    api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set'
});

// Cloudinary storage for production (Vercel)
const cloudinaryStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        let folder = 'rpl/general';
        
        // Use different folders based on field name
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
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
        };
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage: cloudinaryStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter
});

module.exports = upload;
