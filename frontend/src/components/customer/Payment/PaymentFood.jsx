import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCreditCard, 
  faArrowLeft,
  faLock,
  faMoneyBill
} from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems, totalAmount } = location.state || { cartItems: [], totalAmount: 0 };

  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'cash'
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });

  const [errors, setErrors] = useState({});

  // Validation functions
  const validateCart = () => {
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return 'Cart is empty. Please add items to your cart.';
    }
    if (typeof totalAmount !== 'number' || totalAmount <= 0) {
      return 'Invalid total amount. Total must be a positive number.';
    }
    for (const item of cartItems) {
      if (!item._id || typeof item._id !== 'string' || !item._id.match(/^[0-9a-fA-F]{24}$/)) {
        return 'Invalid food ID. Each item must have a valid MongoDB ObjectId.';
      }
      if (typeof item.quantity !== 'number' || item.quantity <= 0) {
        return 'Invalid quantity. Each item must have a positive quantity.';
      }
    }
    return '';
  };

  const validateCardNumber = (number) => {
    const cleanNumber = number.replace(/\s/g, '');
    if (!cleanNumber) return 'Card number is required';
    if (!/^\d+$/.test(cleanNumber)) return 'Card number must contain only digits';
    if (cleanNumber.length !== 16) return 'Card number must be exactly 16 digits';
    return '';
  };

  const validateCardHolder = (name) => {
    if (!name) return 'Cardholder name is required';
    if (!/^[A-Za-z\s]+$/.test(name)) return 'Name can only contain letters and spaces';
    if (name.length < 3) return 'Name must be at least 3 characters long';
    return '';
  };

  const validateExpiryDate = (date) => {
    if (!date) return 'Expiry date is required';
    if (!/^\d{2}\/\d{2}$/.test(date)) return 'Invalid format (MM/YY)';
    const [month, year] = date.split('/');
    const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
    const today = new Date();
    if (expiry <= today) return 'Card has expired';
    return '';
  };

  const validateCVV = (cvv) => {
    if (!cvv) return 'CVV is required';
    if (!/^\d+$/.test(cvv)) return 'CVV must contain only digits';
    if (cvv.length !== 3) return 'CVV must be exactly 3 digits';
    return '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    switch (name) {
      case 'cardNumber':
        // Only allow digits and format with spaces
        formattedValue = value
          .replace(/\D/g, '')
          .slice(0, 16)
          .replace(/(\d{4})(?=\d)/g, '$1 ');
        break;

      case 'cardHolder':
        // Only allow letters and spaces
        formattedValue = value.replace(/[^A-Za-z\s]/g, '');
        break;

      case 'expiryDate':
        // Format as MM/YY
        formattedValue = value
          .replace(/\D/g, '')
          .slice(0, 4)
          .replace(/(\d{2})(\d)/, '$1/$2');
        break;

      case 'cvv':
        // Only allow 3 digits
        formattedValue = value.replace(/\D/g, '').slice(0, 3);
        break;

      default:
        break;
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    // Validate in real-time
    let error = '';
    switch (name) {
      case 'cardNumber':
        error = validateCardNumber(formattedValue);
        break;
      case 'cardHolder':
        error = validateCardHolder(formattedValue);
        break;
      case 'expiryDate':
        error = validateExpiryDate(formattedValue);
        break;
      case 'cvv':
        error = validateCVV(formattedValue);
        break;
      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleCashPayment = async () => {
    const cartError = validateCart();
    if (cartError) {
      toast.error(cartError);
      return;
    }

    try {
      const meals = cartItems.map(item => ({
        food: item._id,
        quantity: item.quantity
      }));

      const payload = {
        meals,
        totalprice: totalAmount,
        paymentMethod: 'cash',
        status: 'pending'
      };
      const API_BASE = import.meta.env.VITE_API_BASE_URL;
      const response = await axios.post(`${API_BASE}/api/orders`, payload);
      
      if (response.status === 201) {
        toast.success('Order placed successfully! Please pay at counter.');
        localStorage.removeItem('foodCart');
        setTimeout(() => {
          navigate('/order-confirm', { 
            state: { 
              orderDetails: {
                items: cartItems,
                total: totalAmount,
                paymentMethod: 'cash',
                orderId: response.data.data._id
              }
            }
          });
        }, 2000);
      }
    } catch (error) {
      console.error('Error placing cash order:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to place order. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (paymentMethod === 'cash') {
      await handleCashPayment();
      return;
    }

    // Validate card payment
    const cartError = validateCart();
    if (cartError) {
      toast.error(cartError);
      return;
    }

    const newErrors = {};
    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length !== 16) {
      newErrors.cardNumber = 'Valid card number is required';
    }
    if (!formData.cardHolder) {
      newErrors.cardHolder = 'Cardholder name is required';
    }
    if (!formData.expiryDate || !/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Valid expiry date is required';
    }
    if (!formData.cvv || formData.cvv.length !== 3) {
      newErrors.cvv = 'Valid CVV is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Process card payment
    toast.info('Processing payment...');
    try {
      const meals = cartItems.map(item => ({
        food: item._id,
        quantity: item.quantity,
        price: item.price,
        name: item.name
      }));

      const paymentDetails = {
        cardNumber: formData.cardNumber.replace(/\s/g, '').slice(-4), // Only send last 4 digits
        cardHolder: formData.cardHolder,
        expiryDate: formData.expiryDate,
        paymentMethod: 'card'
      };

      const payload = {
        meals,
        totalprice: totalAmount,
        paymentMethod: 'card',
        status: 'paid',
        paymentDetails,
        orderDate: new Date().toISOString(),
        customerDetails: {
          // Add any customer details you have access to
          // For example, if you have user info in localStorage or context
          // customerId: localStorage.getItem('userId'),
          // customerName: localStorage.getItem('userName'),
        }
      };

      const API_BASE = import.meta.env.VITE_API_BASE_URL;
      const response = await axios.post(`${API_BASE}/api/orders`, payload);

      if (response.status === 201) {
        // Show success notification with more details
        toast.success(
          <div>
            <h3 className="font-bold mb-2">Payment Successful! 🎉</h3>
            <p>Order ID: {response.data.data._id}</p>
            <p>Amount: ${totalAmount.toFixed(2)}</p>
            <p>Payment Method: Card</p>
            <p className="text-sm mt-2">Redirecting to order confirmation...</p>
          </div>,
          {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          }
        );

        localStorage.removeItem('foodCart');
        setTimeout(() => {
          navigate('/order-confirm', { 
            state: { 
              orderDetails: {
                items: cartItems,
                total: totalAmount,
                paymentMethod: 'card',
                orderId: response.data.data._id,
                paymentDetails: {
                  ...paymentDetails,
                  transactionId: response.data.data._id
                }
              }
            }
          });
        }, 2000);
      }
    } catch (error) {
      console.error('Error processing card payment:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-deep-space pt-16 pb-8">
      <div className="max-w-2xl mx-auto px-4">
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center text-amber hover:text-scarlet mb-6"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Back to Cart
        </button>

        <div className="bg-electric-purple/10 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-amber mb-6">Payment</h1>

          {/* Order Summary */}
          <div className="mb-6 p-4 bg-deep-space/50 rounded-lg">
            <h2 className="text-lg font-semibold text-silver mb-3">Order Summary</h2>
            <div className="space-y-2">
              {cartItems.map(item => (
                <div key={item._id} className="flex justify-between text-silver">
                  <span>{item.name} × {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-silver/20 pt-2 mt-2">
                <div className="flex justify-between font-bold">
                  <span className="text-silver">Total Amount</span>
                  <span className="text-amber">${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-silver mb-3">Payment Method</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-4 rounded-lg flex items-center justify-center gap-2 transition-colors duration-300 ${
                  paymentMethod === 'card' 
                    ? 'bg-scarlet text-black' 
                    : 'bg-deep-space/50 text-silver hover:bg-electric-purple/20'
                }`}
              >
                <FontAwesomeIcon icon={faCreditCard} />
                <span>Card Payment</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-4 rounded-lg flex items-center justify-center gap-2 transition-colors duration-300 ${
                  paymentMethod === 'cash' 
                    ? 'bg-scarlet text-black' 
                    : 'bg-deep-space/50 text-silver hover:bg-electric-purple/20'
                }`}
              >
                <FontAwesomeIcon icon={faMoneyBill} />
                <span>Cash Payment</span>
              </button>
            </div>
          </div>

          {/* Card Payment Form */}
          {paymentMethod === 'card' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Card Number Input */}
              <div>
                <label className="block text-silver mb-2">
                  Card Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  placeholder="1234 5678 9012 3456"
                  className={`w-full px-4 py-2 rounded-lg bg-deep-space border ${
                    errors.cardNumber ? 'border-red-500' : 'border-silver/20'
                  } text-silver focus:outline-none focus:border-amber`}
                />
                {errors.cardNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
                )}
                <p className="text-silver/60 text-xs mt-1">
                  Enter a 16-digit card number
                </p>
              </div>

              {/* Cardholder Name Input */}
              <div>
                <label className="block text-silver mb-2">
                  Cardholder Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="cardHolder"
                  value={formData.cardHolder}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className={`w-full px-4 py-2 rounded-lg bg-deep-space border ${
                    errors.cardHolder ? 'border-red-500' : 'border-silver/20'
                  } text-silver focus:outline-none focus:border-amber`}
                />
                {errors.cardHolder && (
                  <p className="text-red-500 text-sm mt-1">{errors.cardHolder}</p>
                )}
                <p className="text-silver/60 text-xs mt-1">
                  Letters and spaces only
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Expiry Date Input */}
                <div>
                  <label className="block text-silver mb-2">
                    Expiry Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    placeholder="MM/YY"
                    className={`w-full px-4 py-2 rounded-lg bg-deep-space border ${
                      errors.expiryDate ? 'border-red-500' : 'border-silver/20'
                    } text-silver focus:outline-none focus:border-amber`}
                  />
                  {errors.expiryDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>
                  )}
                  <p className="text-silver/60 text-xs mt-1">
                    Must be a future date
                  </p>
                </div>

                {/* CVV Input */}
                <div>
                  <label className="block text-silver mb-2">
                    CVV <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    placeholder="123"
                    className={`w-full px-4 py-2 rounded-lg bg-deep-space border ${
                      errors.cvv ? 'border-red-500' : 'border-silver/20'
                    } text-silver focus:outline-none focus:border-amber`}
                  />
                  {errors.cvv && (
                    <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
                  )}
                  <p className="text-silver/60 text-xs mt-1">
                    3 digits on back of card
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={Object.keys(errors).some(key => errors[key])}
                className={`w-full mt-6 px-6 py-3 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2 ${
                  Object.keys(errors).some(key => errors[key])
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-scarlet hover:bg-amber text-black'
                }`}
              >
                <FontAwesomeIcon icon={faLock} />
                Pay ${totalAmount.toFixed(2)}
              </button>
            </form>
          )}

          {/* Cash Payment Button */}
          {paymentMethod === 'cash' && (
            <button
              onClick={handleCashPayment}
              className="w-full mt-6 bg-scarlet hover:bg-amber px-6 py-3 rounded-lg transition-colors duration-300 text-black font-bold flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={faMoneyBill} />
              Pay ${totalAmount.toFixed(2)} at Counter
            </button>
          )}
        </div>
      </div>
      <ToastContainer theme="dark" />
    </div>
  );
};

export default Payment;