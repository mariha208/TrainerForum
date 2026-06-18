const Razorpay = require('razorpay');

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'your_key_id_here',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'your_key_secret_here',
});

module.exports = razorpayInstance;
