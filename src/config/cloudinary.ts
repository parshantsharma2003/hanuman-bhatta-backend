import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';

// Check if Cloudinary is configured
const isCloudinaryConfigured = 
  env.cloudinaryCloudName && 
  env.cloudinaryCloudName !== 'your-cloud-name' &&
  env.cloudinaryApiKey && 
  env.cloudinaryApiKey !== 'your-api-key' &&
  env.cloudinaryApiSecret && 
  env.cloudinaryApiSecret !== 'your-api-secret';

if (!isCloudinaryConfigured) {
  console.warn('⚠️  Cloudinary is not configured. Image/video uploads will fail.');
  console.warn('   Please sign up at https://cloudinary.com and add your credentials to .env file:');
  console.warn('   - CLOUDINARY_CLOUD_NAME');
  console.warn('   - CLOUDINARY_API_KEY');
  console.warn('   - CLOUDINARY_API_SECRET');
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.cloudinaryCloudName,
  api_key: env.cloudinaryApiKey,
  api_secret: env.cloudinaryApiSecret,
});

export default cloudinary;

// Upload image to Cloudinary
export const uploadImage = async (file: any) => {
  if (!isCloudinaryConfigured) {
    throw new Error(
      'Cloudinary is not configured. Please add your Cloudinary credentials to the .env file. ' +
      'Sign up for free at https://cloudinary.com'
    );
  }

  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: 'hanuman-bhatta/gallery',
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 800, crop: 'fill', quality: 'auto:good' },
      ],
    });

    return {
      mediaUrl: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload image: ${error.message || 'Unknown error'}`);
  }
};

// Upload video to Cloudinary
export const uploadVideo = async (file: any) => {
  if (!isCloudinaryConfigured) {
    throw new Error(
      'Cloudinary is not configured. Please add your Cloudinary credentials to the .env file. ' +
      'Sign up for free at https://cloudinary.com'
    );
  }

  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: 'hanuman-bhatta/gallery',
      resource_type: 'video',
      transformation: [
        { width: 1280, height: 720, crop: 'fill', quality: 'auto:good' },
      ],
    });

    return {
      mediaUrl: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload video: ${error.message || 'Unknown error'}`);
  }
};

// Delete media from Cloudinary
export const deleteMedia = async (publicId: string, resourceType: 'image' | 'video') => {
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  } catch (error) {
    throw new Error('Failed to delete media from Cloudinary');
  }
};
