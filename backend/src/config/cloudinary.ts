import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
const configureCloudinary = (): void => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  console.log('Cloudinary configured successfully');
};

// Upload image to Cloudinary from buffer (memory storage)
export const uploadImage = async (fileBuffer: Buffer, folder: string = 'products'): Promise<any> => {
  try {
    return new Promise((resolve, reject) => {
      // Upload from buffer using upload_stream
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'image',
          transformation: [
            { width: 800, height: 600, crop: 'limit' },
            { quality: 'auto' },
            { format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Error uploading image to Cloudinary:', error);
            reject(new Error('Failed to upload image'));
          } else if (result) {
            resolve({
              public_id: result.public_id,
              secure_url: result.secure_url,
              width: result.width,
              height: result.height
            });
          }
        }
      );

      // Write buffer to the stream
      uploadStream.end(fileBuffer);
    });
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw new Error('Failed to upload image');
  }
};

// Upload PDF to Cloudinary from buffer (memory storage)
export const uploadPDF = async (fileBuffer: Buffer, folder: string = 'documents'): Promise<any> => {
  try {
    return new Promise((resolve, reject) => {
      // Upload from buffer using upload_stream
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'raw',
          format: 'pdf'
        },
        (error, result) => {
          if (error) {
            console.error('Error uploading PDF to Cloudinary:', error);
            reject(new Error('Failed to upload PDF'));
          } else if (result) {
            resolve({
              public_id: result.public_id,
              secure_url: result.secure_url,
              format: result.format,
              bytes: result.bytes
            });
          }
        }
      );

      // Write buffer to the stream
      uploadStream.end(fileBuffer);
    });
  } catch (error) {
    console.error('Error uploading PDF to Cloudinary:', error);
    throw new Error('Failed to upload PDF');
  }
};

// Delete file from Cloudinary
export const deleteFile = async (publicId: string, resourceType: 'image' | 'raw' = 'image'): Promise<any> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    
    return result;
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    throw new Error('Failed to delete file');
  }
};

export { cloudinary };
export default configureCloudinary;