import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainNavBar from '../../navbar/MainNavBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faFilter, 
  faShoppingCart,
  faDollarSign
} from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ShowFoods = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const API_BASE = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${API_BASE}/api/foods`);
      if (!response.ok) {
        throw new Error('Failed to fetch foods');
      }
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setFoods(data.data);
        setError(null);
      } else {
        throw new Error('Invalid data format received from server');
      }
    } catch (error) {
      console.error('Error fetching foods:', error);
      toast.error('Failed to load food items. Please try again later.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setError('Failed to load food items. Please try again later.');
      setFoods([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (food) => {
    const confirmAdd = window.confirm('Would you like to add this item to your cart?');
    if (confirmAdd) {
      // Get existing cart items
      const existingCart = JSON.parse(localStorage.getItem('foodCart') || '[]');
      
      // Check if item already exists in cart
      const existingItem = existingCart.find(item => item._id === food._id);
      
      let newCart;
      if (existingItem) {
        // If item exists, increment quantity
        newCart = existingCart.map(item =>
          item._id === food._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // If item doesn't exist, add it with quantity 1
        newCart = [...existingCart, { ...food, quantity: 1 }];
      }
      
      // Save to localStorage
      localStorage.setItem('foodCart', JSON.stringify(newCart));
      
      toast.success('Item added to cart!');
      navigate('/cart');
    }
  };

  const categories = ['all', ...new Set(foods.map(food => food.category))];

  const filteredFoods = foods
    .filter(food => {
      const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || food.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

  return (
    <div className="min-h-screen bg-deep-space pt-16">
      <MainNavBar />
      <ToastContainer theme="dark" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-amber mb-4">Food & Beverages</h1>
          <p className="text-silver text-lg">Enhance your movie experience with our delicious treats</p>
        </div>

        <div className="bg-electric-purple/10 rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-silver" />
                <input
                  type="text"
                  placeholder="Search foods..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-deep-space border border-silver/20 rounded-lg text-silver focus:outline-none focus:border-amber"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="relative">
                <FontAwesomeIcon icon={faFilter} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-silver" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-deep-space border border-silver/20 rounded-lg text-silver focus:outline-none focus:border-amber"
                >
                  {categories.map(category => (
                    <option key={category} value={category} className="capitalize">{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFoods.map((food) => (
              <div
                key={food._id}
                className="bg-electric-purple/10 rounded-lg overflow-hidden transform transition-transform duration-300 hover:scale-105"
              >
                <div className="relative">
                  <img
                    src={food.imageUrl}
                    alt={food.name}
                    className="w-full h-[280px] object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-amber mb-1">{food.name}</h3>
                  <p className="text-silver text-sm mb-1 capitalize">{food.category}</p>
                  <p className="text-silver text-sm mb-2 line-clamp-2">{food.description}</p>
                  <div className="flex items-center text-silver text-sm mb-3">
                    <FontAwesomeIcon icon={faDollarSign} className="mr-2" />
                    <span>Price: ${food.price}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(food)}
                      className="flex-1 flex items-center space-x-2 bg-amber hover:bg-scarlet px-3 py-1.5 rounded-lg transition-colors duration-300 text-sm text-black justify-center"
                    >
                      <FontAwesomeIcon icon={faShoppingCart} className='text-black'/>
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredFoods.length === 0 && (
          <div className="text-center py-12">
            <p className="text-silver text-lg">No food items found matching your criteria.</p>
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

export default ShowFoods;
