/**
 * Utility to validate environment configuration
 */

export const validateEnvironmentConfig = (): void => {
  const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ];

  const missingVars: string[] = [];

  requiredEnvVars.forEach(varName => {
    if (!process.env[varName] || process.env[varName] === 'your_cloudinary_cloud_name' || 
        process.env[varName] === 'your_cloudinary_api_key' || 
        process.env[varName] === 'your_cloudinary_api_secret') {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.warn('⚠️  Warning: The following environment variables need to be configured:');
    missingVars.forEach(varName => {
      console.warn(`   - ${varName}`);
    });
    console.warn('   Please update your .env file with actual values.');
  } else {
    console.log('✅ All required environment variables are configured');
  }
};

export const getConfigStatus = () => {
  return {
    mongodb: {
      configured: !!process.env.MONGODB_URI,
      uri: process.env.MONGODB_URI || 'Not configured'
    },
    jwt: {
      configured: !!process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    },
    cloudinary: {
      configured: !!(process.env.CLOUDINARY_CLOUD_NAME && 
                     process.env.CLOUDINARY_API_KEY && 
                     process.env.CLOUDINARY_API_SECRET),
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'Not configured'
    },
    server: {
      port: process.env.PORT || 5000,
      environment: process.env.NODE_ENV || 'development'
    }
  };
};