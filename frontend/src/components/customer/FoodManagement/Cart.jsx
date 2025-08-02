import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainNavBar from '../../navbar/MainNavBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrash, 
  faMinus, 
  faPlus, 
  faShoppingCart,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ShowFoods from './ShowFoods';


const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadCartItems();
  }, []);

  const loadCartItems = () => {
    const savedCart = localStorage.getItem('foodCart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  };

  const updateCart = (newCart) => {
    setCartItems(newCart);
    localStorage.setItem('foodCart', JSON.stringify(newCart));
  };

  const increaseQuantity = (itemId) => {
    const newCart = cartItems.map(item => {
      if (item._id === itemId) {
        return { ...item, quantity: item.quantity + 1 };
      }
      return item;
    });
    updateCart(newCart);
    toast.success('Quantity increased');
  };

  const decreaseQuantity = (itemId) => {
    const newCart = cartItems.map(item => {
      if (item._id === itemId) {
        const newQuantity = Math.max(1, item.quantity - 1);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    updateCart(newCart);
    toast.info('Quantity decreased');
  };

  const removeItem = (itemId) => {
    const newCart = cartItems.filter(item => item._id !== itemId);
    updateCart(newCart);
    toast.success('Item removed from cart');
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <div className="min-h-screen bg-deep-space pt-16">
      <MainNavBar />
      <ToastContainer theme="dark" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/foods')}
          className="flex items-center text-amber hover:text-scarlet mb-6"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Continue Shopping
        </button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber mb-4">Shopping Cart</h1>
          <p className="text-silver text-lg">
            {cartItems.length} item(s) in your cart
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-12 bg-electric-purple/10 rounded-lg">
            <FontAwesomeIcon icon={faShoppingCart} className="text-4xl text-silver mb-4" />
            <p className="text-silver text-lg mb-4">Your cart is empty</p>
            <button
              onClick={() => navigate('/showfoods')}
              className="bg-scarlet hover:bg-amber px-6 py-2 rounded-lg transition-colors duration-300 text-black"
            >
              Browse Foods
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div 
                  key={item._id}
                  className="bg-electric-purple/10 rounded-lg p-4 flex items-center gap-4"
                >
                  <img
                    src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${item.imageUrl}`}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-amber">{item.name}</h3>
                    <p className="text-silver">${item.price} each</p>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center bg-deep-space rounded-lg">
                      <button
                        onClick={() => decreaseQuantity(item._id)}
                        className="px-3 py-1 text-silver hover:text-amber"
                      >
                        <FontAwesomeIcon icon={faMinus} />
                      </button>
                      <span className="px-4 py-1 text-silver border-x border-silver/20">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => increaseQuantity(item._id)}
                        className="px-3 py-1 text-silver hover:text-amber"
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item._id)}
                      className="text-scarlet hover:text-red-700"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-amber font-bold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-electric-purple/10 rounded-lg p-6 sticky top-24">
                <h2 className="text-xl font-bold text-amber mb-6">Order Summary</h2>
                <div className="space-y-4">
                  {cartItems.map(item => (
                    <div key={item._id} className="flex justify-between text-silver">
                      <span>{item.name} × {item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t border-silver/20 pt-4 mt-4">
                    <div className="flex justify-between font-bold">
                      <span className="text-silver">Total</span>
                      <span className="text-amber">${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/PaymentFood', { 
                    state: { 
                      cartItems: cartItems,
                      totalAmount: calculateTotal()
                    }
                  })}
                  className="px-6 py-2.5 bg-scarlet hover:bg-amber text-white rounded-lg transition-colors duration-300 flex items-center"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-deep-space border-t border-silver/10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-silver">
            <p>© {new Date().getFullYear()} GalaxyX Cinema. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Cart;
