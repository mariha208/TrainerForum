/**
 * Razorpay Payment Integration
 * Include <script src="https://checkout.razorpay.com/v1/checkout.js"></script> in your HTML before using this.
 */

/**
 * Handle the payment flow
 * @param {number} amount - Amount to charge the user (in INR)
 */
async function handlePayment(amount) {
    try {
        // 1. Call your backend API to create an order
        const response = await fetch('/api/payments/create-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                amount: amount,
                receipt: `receipt_${Date.now()}` // Generate a unique receipt ID
            }),
        });

        const data = await response.json();

        if (!data.success) {
            alert('Failed to create order');
            return;
        }

        // 2. Configure Razorpay Checkout options
        const options = {
            key: 'your_key_id_here', // Update with your actual key in production if you want, but safe to expose public key here
            amount: data.order.amount, 
            currency: 'INR',
            name: 'World Trainer Forum',
            description: 'Service Payment',
            order_id: data.order.id, // This is the order ID created by our backend
            handler: function (response) {
                // 3. This callback gets executed after a successful payment on the modal
                verifyPaymentSignature(response);
            },
            theme: {
                color: '#3399cc'
            }
        };

        // 4. Open the Razorpay Checkout Modal
        if (!window.Razorpay) {
            alert('Razorpay SDK not loaded. Please ensure checkout.js is included.');
            return;
        }
        const rzp = new window.Razorpay(options);
        
        rzp.on('payment.failed', function (response){
            alert('Payment Failed: ' + response.error.description);
            console.error('Payment Failed:', response.error);
        });

        rzp.open();
    } catch (error) {
        console.error('Error during checkout setup:', error);
        alert('An error occurred during checkout.');
    }
}

/**
 * Verifies the payment with our backend
 */
async function verifyPaymentSignature(paymentResponse) {
    try {
        const response = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature
            }),
        });

        const data = await response.json();

        if (data.success) {
            alert('Payment Successful and Verified!');
            // You can redirect the user here
            // window.location.href = '/dashboard.html';
        } else {
            alert('Payment Verification Failed!');
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        alert('An error occurred while verifying the payment.');
    }
}
