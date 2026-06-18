const razorpayInstance = require('../config/razorpay');
const { verifyRazorpaySignature } = require('../utils/signatureHelper');

/**
 * Creates a new Razorpay order
 * @param {number} amount - Amount in INR (e.g., 500 for ₹500)
 * @param {string} receipt - Unique receipt ID
 * @returns {Promise<Object>} Razorpay order object
 */
const createOrder = async (amount, receipt) => {
    try {
        const options = {
            amount: amount * 100, // Razorpay expects amount in paise (smallest currency unit)
            currency: 'INR',
            receipt: receipt,
            payment_capture: 1 // Auto-capture payment
        };
        
        const order = await razorpayInstance.orders.create(options);
        return order;
    } catch (error) {
        throw new Error(`Failed to create Razorpay order: ${error.message}`);
    }
};

/**
 * Verifies payment authenticity
 */
const verifyPayment = (orderId, paymentId, signature) => {
    const secret = process.env.RAZORPAY_KEY_SECRET || 'your_key_secret_here';
    
    const isValid = verifyRazorpaySignature(orderId, paymentId, signature, secret);
    
    if (!isValid) {
        throw new Error('Invalid payment signature');
    }
    
    // NOTE: This is where you would typically update your database 
    // to mark the order as "Paid" or "Completed".
    
    return { success: true, message: 'Payment verified successfully' };
};

module.exports = {
    createOrder,
    verifyPayment
};
