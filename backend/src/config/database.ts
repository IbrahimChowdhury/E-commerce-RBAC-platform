import mongoose from 'mongoose';

const connectDB = async (retries: number = 5): Promise<void> => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
  
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        socketTimeoutMS: 45000,
      });
      
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return; // Connection successful, exit function
      
    } catch (error: any) {
      console.error(`❌ MongoDB connection attempt ${i + 1}/${retries} failed:`, error.message);
      
      // If this is the last retry, throw error
      if (i === retries - 1) {
        console.error('❌ All MongoDB connection attempts failed');
        console.error('💡 Please check:');
        console.error('   1. MongoDB Atlas Network Access (IP Whitelist)');
        console.error('   2. Add 0.0.0.0/0 to allow all IPs');
        console.error('   3. Connection string is correct');
        console.error('   4. Username and password are correct');
        
        // In serverless environment, don't exit process
        if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
          throw error; // Let the function handle the error
        } else {
          process.exit(1); // Exit in traditional server
        }
      }
      
      // Wait before retrying (exponential backoff)
      const waitTime = Math.min(1000 * Math.pow(2, i), 10000); // Max 10 seconds
      console.log(`⏳ Retrying in ${waitTime / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
};

export default connectDB;