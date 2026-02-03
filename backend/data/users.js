const bcrypt = require('bcryptjs');

const users = [
    {
        name: 'Admin User',
        email: 'admin@shop.com',
        password: 'admin123', // Will be hashed by seeder/model if using create, but insertMany bypasses hooks usually.
        // Actually insertMany bypasses 'save' hooks. 
        // So I should pre-hash them here or use a loop in seeder.
        // For simplicity in seeder with insertMany, I will pre-hash manually or use a helper.
        // Wait, bcrypt hash is async.
        // Let's just store plain text here and handle hashing in seeder loop? 
        // OR easier: just hash them here hardcoded? No, salt changes.
        // Best practice: Loop in seeder. But my seeder used insertMany.
        // I will update seeder logic to loop OR hash here.
        isAdmin: true
    },
    {
        name: 'John Doe',
        email: 'user@shop.com',
        password: 'user123',
        isAdmin: false
    }
];

// NOTE: Ideally we hash these in the seeder.
// Since my seeder uses insertMany which bypasses mongoose middleware, 
// I will just put the plain text here and I will modify the Seeder to specificially hash passwords 
// OR simpler: use a loop in Seeder instead of insertMany for users.
// I'll stick to plain text here.
module.exports = users;
