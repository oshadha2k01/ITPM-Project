import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEnvelope, 
  faLock, 
  faSignInAlt, 
  faSpinner, 
  faUserFriends, 
  faFilm 
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const MovieBuddyLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Create state to store booking details
  const [bookingDetails, setBookingDetails] = useState({});
  const [isEmailFromRegistration, setIsEmailFromRegistration] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);

  // Update booking details whenever location state changes or on initial load
  useEffect(() => {
    // Only use data from location state, not localStorage
    if (location.state?.bookingDetails || location.state?.movieName) {
      const newBookingDetails = location.state?.bookingDetails || location.state;
      setBookingDetails(newBookingDetails);
    }
    
    // Show registration completion message if user just completed registration
    // Registration message has been removed to avoid duplicate notifications
    
    // Auto-fill email if available from registration
    const tempEmail = localStorage.getItem('tempUserEmail');
    if (tempEmail) {
      setFormData(prev => ({
        ...prev,
        email: tempEmail
      }));
      setIsEmailFromRegistration(true);
      // Remove temp email after using it
      localStorage.removeItem('tempUserEmail');
    }
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.email.trim()) {
      toast.error('Email is required');
      return false;
    }
    
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    
    if (!formData.password || !formData.password.trim()) {
      toast.error('Password is required');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      console.log('Attempting login with:', { email: formData.email });
      
      // Make API call to authenticate with the correct endpoint
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/movie-buddies/login`, {
        email: formData.email,
        password: formData.password
      });
      
      
      console.log('Login response data:', response.data);
      
      // Check if login was successful with proper response structure
      if (response.data && response.data.success) {
        // Store user data from MovieBuddy response
        const userData = {
          email: response.data.email,
          name: response.data.name,
          phone: response.data.phone,
          userId: response.data.id
        };
        
        // Store user credentials in localStorage for persistent login
        localStorage.setItem('userEmail', userData.email);
        localStorage.setItem('userName', userData.name);
        localStorage.setItem('userPhone', userData.phone || '');
        localStorage.setItem('userId', userData.userId);

        console.log('User data stored in localStorage:', userData);
        
        // Check if user came from booking flow with new movie details
        if (bookingDetails && bookingDetails.movieName && bookingDetails.movieDate && bookingDetails.movieTime) {
          console.log('User has new movie details, updating existing record...');
          
          try {
            // Auto-update movie details for existing user
            const updateResponse = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/movie-buddies/update-movie-details`, {
              email: userData.email,
              movieName: bookingDetails.movieName,
              movieDate: bookingDetails.movieDate,
              movieTime: bookingDetails.movieTime
            });
            
            if (updateResponse.data.success) {
              console.log('Movie details updated successfully');
              toast.success(`Welcome back, ${userData.name}! Your movie details have been updated.`);
              
              // Store updated movie details for MovieBuddyList
              localStorage.setItem('userMovieDetails', JSON.stringify({
                movieName: bookingDetails.movieName,
                movieDate: bookingDetails.movieDate,
                movieTime: bookingDetails.movieTime
              }));
            } else {
              console.error('Failed to update movie details:', updateResponse.data);
              toast.success(`Welcome back, ${userData.name}!`);
            }
          } catch (updateError) {
            console.error('Error updating movie details:', updateError);
            toast.success(`Welcome back, ${userData.name}!`);
          }
        } else {
          toast.success(`Welcome back, ${userData.name}!`);
        }
        
        // Navigate to MovieBuddyList after login and optional update
        setTimeout(() => {
          navigate('/movie-buddies');
        }, 1500);
      } else {
        console.error('Login response not as expected:', response.data);
        toast.error(response.data.message || 'Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error details:', error.response?.data);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        errorMessage = error.response.data?.message || 
                       error.response.data?.error || 
                       `Error: ${error.response.status} - ${error.response.statusText}`;
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your internet connection.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-deep-space text-silver flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-electric-purple/10 p-8 rounded-xl border border-silver/10 shadow-lg"
      >
        <div className="text-center">
          <div className="flex justify-center">
            <div className="p-3 bg-amber/20 rounded-full inline-flex">
              <FontAwesomeIcon icon={faUserFriends} className="text-amber text-3xl" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-amber">
            Movie Buddy Login
          </h2>
          <p className="mt-2 text-sm text-silver/70">
            Sign in to connect with other movie enthusiasts
          </p>
          
          {/* Only show booking details if they have the required fields */}
          {bookingDetails && bookingDetails.movieName && bookingDetails.movieDate && bookingDetails.movieTime && (
            <div className="mt-4 p-3 bg-amber/10 rounded-lg">
              <p className="text-sm text-amber font-medium">
                {bookingDetails.movieName} • {bookingDetails.movieDate} • {bookingDetails.movieTime}
              </p>
            </div>
          )}
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-silver mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faEnvelope} className="text-silver/50" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isEmailFromRegistration}
                  className={`w-full px-10 py-2 bg-deep-space border border-silver/20 rounded-lg text-silver focus:outline-none focus:ring-2 focus:ring-amber focus:border-transparent ${isEmailFromRegistration ? 'opacity-60 cursor-not-allowed' : ''}`}
                  placeholder="Enter your email"
                />
              </div>
              {/* {isEmailFromRegistration && (
                <p className="mt-1 text-xs text-amber/70">
                  ✓ Email auto-filled from registration
                </p>
              )} */}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-silver mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faLock} className="text-silver/50" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-10 py-2 bg-deep-space border border-silver/20 rounded-lg text-silver focus:outline-none focus:ring-2 focus:ring-amber focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="h-4 w-4 text-amber focus:ring-amber border-silver/30 rounded bg-deep-space"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-silver">
                Remember me
              </label>
            </div>
            
            <div className="text-sm">
              <Link to="/forgot-password" className="text-amber hover:text-amber/80">
                Forgot your password?
              </Link>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium ${
                loading ? 'bg-amber/60' : 'bg-amber hover:bg-amber/80'
              } text-deep-space focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber transition-all duration-200`}
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSignInAlt} className="mr-2" />
                  Sign in to Movie Buddy
                </>
              )}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-silver">
            Don't have an account?{' '}
            <Link 
              to="/movie-buddy-signup" 
              state={bookingDetails}
              className="text-amber hover:text-amber/80 font-medium"
            >
              Register as a Movie Buddy
            </Link>
          </p>
        </div>
        
        <div className="mt-6 border-t border-silver/10 pt-6 text-center">
          <Link to="/" className="flex items-center justify-center text-amber hover:text-amber/80">
            <FontAwesomeIcon icon={faFilm} className="mr-2" />
            Return to GalaxyX Cinema
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default MovieBuddyLogin;
