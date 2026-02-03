/**
 * api.js
 * Central file for all backend API requests.
 * Replaces direct localStorage access.
 */

// Use relative path for production (where backend serves frontend)
// This will resolve to http://domain.com/api or http://localhost:5000/api
const API_URL = '/api';

// --- HELPERS ---

function getHeaders() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const headers = {
        'Content-Type': 'application/json'
    };
    if (user && user.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
    }
    return headers;
}

// --- PRODUCTS ---

async function fetchProducts() {
    const res = await fetch(`${API_URL}/products`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return await res.json();
}

async function fetchProductById(id) {
    const res = await fetch(`${API_URL}/products/${id}`);
    if (!res.ok) throw new Error('Product not found');
    return await res.json();
}

// --- USERS ---

async function login(email, password) {
    const res = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Login failed');
    }
    return await res.json();
}

async function register(name, email, password) {
    const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Registration failed');
    }
    return await res.json();
}

// --- ORDERS ---

async function createOrder(orderData) {
    const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: getHeaders(), // Needs Auth
        body: JSON.stringify(orderData)
    });
    if (!res.ok) throw new Error('Failed to place order');
    return await res.json();
}

async function getMyOrders() {
    const res = await fetch(`${API_URL}/orders/myorders`, {
        headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch orders');
    return await res.json();
}

// Export functions globally for now (or use ES modules if we migrate)
window.api = {
    fetchProducts,
    fetchProductById,
    login,
    register,
    createOrder,
    getMyOrders
};
