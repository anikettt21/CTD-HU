const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./backend/config/db');

// Load env vars
dotenv.config();

// Connect to database
// Note: You must update .env with your real MongoDB URI
// Connect to database
connectDB().then(async () => {
    // AUTO-SEEDER: Check if empty and seed
    const User = require('./backend/models/User');
    const Product = require('./backend/models/Product');
    const users = require('./backend/data/users');
    const products = require('./backend/data/products');
    const bcrypt = require('bcryptjs');

    const count = await User.countDocuments();
    if (count === 0) {
        console.log("Database empty. Auto-seeding...");

        // Hash passwords
        for (const user of users) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
        }

        const createdUsers = await User.insertMany(users);
        const adminUser = createdUsers[0]._id;

        const sampleProducts = products.map(product => {
            return { ...product, user: adminUser };
        });

        await Product.insertMany(sampleProducts);
        console.log("Auto-seed complete: Users and Products added.");
    }
});

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

const path = require('path');

// Basic Route
// app.get('/', (req, res) => {
//     res.send('API is running...');
// });

// Serve Static Frontend Files
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Serve HTML files
const pages = [
    'index.html', 'login.html', 'product.html', 'cart.html',
    'checkout.html', 'orders.html', 'profile.html', 'wishlist.html', 'about.html'
];

pages.forEach(page => {
    app.get(`/${page}`, (req, res) => {
        res.sendFile(path.resolve(__dirname, page));
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'index.html'));
});

const productRoutes = require('./backend/routes/productRoutes');
const userRoutes = require('./backend/routes/userRoutes');
const orderRoutes = require('./backend/routes/orderRoutes');

// ...

// Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log('Use http://localhost:5000/ to access the API');
});
