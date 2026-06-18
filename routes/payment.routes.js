const express = require('express');
const { createOrderHandler, verifyPaymentHandler } = require('../controllers/payment.controller');

const router = express.Router();

// Route: POST /api/payments/create-order
router.post('/create-order', createOrderHandler);

// Route: POST /api/payments/verify
router.post('/verify', verifyPaymentHandler);

module.exports = router;
