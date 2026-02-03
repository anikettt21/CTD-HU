const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./backend/config/db');

// Load env vars
dotenv.config();

// Connect to database
// Note: You must update .env with your real MongoDB URI
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Basic Route
app.get('/', (req, res) => {
    res.send('API is running...');
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
