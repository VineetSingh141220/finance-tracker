import mongoose from 'mongoose';

const connectDB = async () => {
    const uri = process.env.MONGODB_URI!;
    let retries = 5;

    while (retries) {
        try {
            await mongoose.connect(uri);
            console.log('✅ MongoDB connected');
            return;
        } catch (err) {
            retries--;
            console.log(`MongoDB connection failed. Retries left: ${retries}`);
            if (!retries) throw err;
            await new Promise(r => setTimeout(r, 3000));
        }
    }
};

export default connectDB;
