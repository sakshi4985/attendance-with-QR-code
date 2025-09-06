// Mongo connection helper with clear logs
import mongoose from 'mongoose';

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('MongoDB connection error: MONGODB_URI environment variable is not defined.');
    console.error('Please create a .env file in the backend directory with MONGODB_URI set.');
    process.exit(1);
  }

try {
const conn = await mongoose.connect(process.env.MONGODB_URI, {
autoIndex: true
});
console.log(`MongoDB connected: ${conn.connection.host}`);
} catch (err) {
console.error('MongoDB connection error:', err.message);
process.exit(1);
}
};


export default connectDB;