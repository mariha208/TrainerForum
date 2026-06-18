const paymentService = require('../services/payment.service');

const createOrderHandler = async (req, res, next) => {
    try {
        const { amount, receipt } = req.body;
        
        // Basic validation
        if (!amount || !receipt) {
            return res.status(400).json({ success: false, message: 'Amount and receipt are required' });
        }

        const order = await paymentService.createOrder(amount, receipt);
        
        res.status(201).json({
            success: true,
            order
        });
    } catch (error) {
        // Pass to global error middleware
        res.status(500).json({ success: false, message: error.message });
    }
};

const verifyPaymentHandler = async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Missing payment details' });
        }

        const result = paymentService.verifyPayment(
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature
        );
        
        res.status(200).json(result);
    } catch (error) {
        // Return 400 for invalid signature to prevent order fulfillment
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    createOrderHandler,
    verifyPaymentHandler
};
