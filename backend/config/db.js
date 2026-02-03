const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
    try {
        console.log("Starting In-Memory MongoDB (for testing)...");
        const mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        console.log(`In-Memory MongoDB connected at: ${uri}`);

        // Connect Mongoose to the in-memory instance
        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Expose URI to process.env if needed elsewhere
        process.env.MONGO_URI = uri;

    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
