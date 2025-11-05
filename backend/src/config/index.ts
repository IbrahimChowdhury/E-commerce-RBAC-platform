import dotenv from 'dotenv';
import connectDB from './database';
import configureCloudinary from './cloudinary';
import { validateEnvironmentConfig, getConfigStatus } from '../utils/validateConfig';

// Load environment variables
dotenv.config();

// Initialize all configurations
export const initializeConfig = async (): Promise<void> => {
  try {
    console.log('🚀 Initializing application configurations...');
    
    // Validate environment variables
    validateEnvironmentConfig();
    
    // Connect to MongoDB
    await connectDB();
    
    // Configure Cloudinary
    configureCloudinary();
    
    // Log configuration status
    const configStatus = getConfigStatus();
    console.log('📋 Configuration Status:', JSON.stringify(configStatus, null, 2));
    
    console.log('✅ All configurations initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing configurations:', error);
    process.exit(1);
  }
};

// Export individual configurations
export { default as connectDB } from './database';
export { default as configureCloudinary } from './cloudinary';
export * from './cloudinary';
export * from './jwt';