const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const users = require('./backend/data/users'); // We need to create this
const products = require('./backend/data/products'); // We need to create this
const User = require('./backend/models/User');
const Product = require('./backend/models/Product');
const Order = require('./backend/models/Order');
const connectDB = require('./backend/config/db');

dotenv.config();

connectDB();

const importData = async () => {
    try {
        await Order.deleteMany();
        await Product.deleteMany();
        await User.deleteMany();

        // Fix: Hash passwords before saving. insertMany doesn't run pre-save hooks.
        // Or change to use create/save loop.

        for (const user of users) {
            // We need to hash manually here or rely on the Model to do it if we used .save()
            // But let's just use the Model.create is easier but also might not fire hooks?
            // Actually Model.create() DOES fire 'save' hooks. insertMany does NOT.

            // Let's use create inside a loop
            // But we need to capture the created users to get the Admin ID.
            // Easier: Just manually hash here locally since we have bcrypt installed.

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
        }

        const createdUsers = await User.insertMany(users);

        const adminUser = createdUsers[0]._id;

        const sampleProducts = products.map(product => {
            return { ...product, user: adminUser };
        });

        await Product.insertMany(sampleProducts);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await Order.deleteMany();
        await Product.deleteMany();
        await User.deleteMany();

        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
