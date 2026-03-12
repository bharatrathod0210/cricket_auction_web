// Utility function to get proper image URL
// Handles both Cloudinary URLs (full HTTP URLs) and local server paths

const API_BASE = import.meta.env.PROD 
    ? 'https://rpl-sihor-backend.vercel.app' 
    : 'http://localhost:5000';

/**
 * Get the full URL for an image
 * @param {string} imagePath - The image path from database (can be Cloudinary URL or local path)
 * @returns {string|null} - Full image URL or null if no image
 */
export const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // If it's already a full URL (Cloudinary or any external URL), return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    
    // If it's a Cloudinary URL without protocol (shouldn't happen but just in case)
    if (imagePath.includes('cloudinary.com')) {
        return imagePath.startsWith('//') ? `https:${imagePath}` : `https://${imagePath}`;
    }
    
    // If it's a local path, prepend API_BASE
    // Make sure path starts with /
    const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${API_BASE}${path}`;
};

export default getImageUrl;
