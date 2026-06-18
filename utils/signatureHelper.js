const crypto = require('crypto');

/**
 * Verifies the Razorpay payment signature
 */
const verifyRazorpaySignature = (orderId, paymentId, signature, secret) => {
    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body.toString())
        .digest('hex');
    
    return expectedSignature === signature;
};

module.exports = {
    verifyRazorpaySignature
};
