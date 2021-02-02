const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: '873163186136771',
    api_secret: 'mKQyDhgPyLoKyxh2UfFKd0ieu40'
})

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'Yelpcamp',
        allowedFormats: ['jpeg', 'png', 'jpg']
    }
})

module.exports = {
    cloudinary,
    storage
}