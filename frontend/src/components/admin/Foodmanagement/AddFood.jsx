import React, { useState, useCallback } from "react";
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUtensils,
  faUpload,
  faTimes,
  faExclamationCircle,
  faDollarSign,
  faList,
  faTag
} from '@fortawesome/free-solid-svg-icons';
import toast, { Toaster } from 'react-hot-toast';
import AdminNavbar from '../../navbar/AdminNavbar';
import { Navigate } from "react-router-dom";

const AddFood = () => {
  const [formData, setFormData] = useState({
    name: "",
    ingrediants: "",
    category: "Food",
    price: "",
    imageUrl: "",
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);

  const availableCategories = ['Food', 'Drinks', 'Snacks', 'Desserts', 'Beverages'];

  const validateName = (name) => {
    if (!name) return 'Food name is required';
    if (name.length < 2) return 'Food name must be at least 2 characters long';
    if (/[^A-Za-z\s]/.test(name)) return 'Food name can only contain letters and spaces';
    return '';
  };

  const validatePrice = (price) => {
    if (!price) return 'Price is required';
    if (!/^\d*\.?\d*$/.test(price)) return 'Price can only contain numbers and decimal point';
    if (parseFloat(price) <= 0) return 'Price must be greater than 0';
    return '';
  };

  const validateIngredients = (ingredients) => {
    if (!ingredients) return 'Ingredients are required';
    if (/[^A-Za-z\s,]/.test(ingredients)) return 'Ingredients can only contain letters, spaces, and commas';
    return '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value;

    switch (name) {
      case 'name':
        sanitizedValue = value.replace(/[^A-Za-z\s]/g, '');
        break;
      
      case 'price':
        sanitizedValue = value.replace(/[^\d.]/g, '');
        const decimalCount = (sanitizedValue.match(/\./g) || []).length;
        if (decimalCount > 1) {
          sanitizedValue = sanitizedValue.slice(0, -1);
        }
        break;
      
      case 'ingredients':
        sanitizedValue = value.replace(/[^A-Za-z\s,]/g, '');
        break;
      
      default:
        break;
    }

    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));

    let error = '';
    switch (name) {
      case 'name':
        error = validateName(sanitizedValue);
        break;
      case 'price':
        error = validatePrice(sanitizedValue);
        break;
      case 'ingredients':
        error = validateIngredients(sanitizedValue);
        break;
      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleImageFile(e.dataTransfer.files[0]);
  }, []);

  const handleImageFile = async (file) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      toast.error('Please upload a valid image (JPG, JPEG, or PNG)');
      return;
    }

    // Create preview for UI
    setImagePreview(URL.createObjectURL(file));
    
    // Convert file to base64
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, imageUrl: reader.result }));
    };

    if (errors.imageUrl) setErrors(prev => ({ ...prev, imageUrl: '' }));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) handleImageFile(e.target.files[0]);
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Add this to prevent form default submission
    
    if (!formData.imageUrl) {
      toast.error('Please upload an image');
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading('Adding food item...');

    try {
      // Create FormData object
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/foods`, {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Food item added successfully!', { id: loadingToast });
        setFormData({
          name: "",
          ingrediants: "",
          category: "Food",
          price: "",
          imageUrl: "",
        });
        setImagePreview(null);
        
      } else {
        throw new Error(data.error || 'Failed to add food item');
      }
    } catch (error) {
      console.error('Error adding food:', error);
      toast.error(
        error.message === 'Failed to fetch'
          ? 'Cannot connect to server. Please check if the server is running.'
          : `Error: ${error.message}`,
        { id: loadingToast }
      );
    } finally {
      
      setLoading(false);

    }
  };
  

  return (
    <div className="min-h-screen bg-deep-space text-silver">
      <AdminNavbar />
      <div className="container mx-auto p-2 md:p-4">
        <Toaster position="top-right" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto bg-electric-purple/10 backdrop-blur-lg rounded-xl p-4 border border-silver/10"
        >
          <div className="flex items-center mb-4">
            <FontAwesomeIcon icon={faUtensils} className="text-amber text-2xl mr-3" />
            <h2 className="text-xl md:text-2xl font-bold text-amber">
              Add New Food Item
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Column 1 */}
            <div className="space-y-4">
              <div
                className="relative group"
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className={`h-36 w-full rounded-lg border-2 border-dashed 
                  ${imagePreview ? 'border-electric-purple' : dragActive ? 'border-amber' : 'border-silver/30'} 
                  flex items-center justify-center overflow-hidden relative
                  ${errors.imageUrl ? 'border-red-500' : ''}`}
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-scarlet hover:bg-amber p-1.5 rounded-full text-white transition-colors duration-300"
                      >
                        <FontAwesomeIcon icon={faTimes} size="sm" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-2">
                      <FontAwesomeIcon icon={faUpload} className="text-amber text-2xl mb-1" />
                      <p className="text-silver text-sm">Upload image</p>
                      <p className="text-silver/60 text-xs">Max: 5MB</p>
                    </div>
                  )}
                  <input
                    type="file"
                    name="imageUrl"
                    onChange={handleImageChange}
                    accept="image/jpeg,image/png,image/jpg"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                {errors.imageUrl && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-red-500 text-xs mt-1 flex items-center"
                  >
                    <FontAwesomeIcon icon={faExclamationCircle} className="mr-1" size="sm" />
                    {errors.imageUrl}
                  </motion.p>
                )}
              </div>

              <div>
                <label className="block text-silver text-sm mb-1">
                  <FontAwesomeIcon icon={faUtensils} className="mr-2" />
                  Food Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full bg-deep-space/50 border rounded-lg px-3 py-2 text-silver text-sm focus:border-electric-purple focus:ring-1 focus:ring-electric-purple outline-none ${errors.name ? 'border-red-500' : 'border-silver/30'}`}
                  required
                />
                {errors.name && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-red-500 text-xs mt-1 flex items-center"
                  >
                    <FontAwesomeIcon icon={faExclamationCircle} className="mr-1" size="sm" />
                    {errors.name}
                  </motion.p>
                )}
              </div>

              <div>
                <label className="block text-silver text-sm mb-1">
                  <FontAwesomeIcon icon={faDollarSign} className="mr-2" />
                  Price
                </label>
                <input
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={`w-full bg-deep-space/50 border rounded-lg px-3 py-2 text-silver text-sm focus:border-electric-purple focus:ring-1 focus:ring-electric-purple outline-none ${errors.price ? 'border-red-500' : 'border-silver/30'}`}
                  required
                />
                {errors.price && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-red-500 text-xs mt-1 flex items-center"
                  >
                    <FontAwesomeIcon icon={faExclamationCircle} className="mr-1" size="sm" />
                    {errors.price}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-4">
              <div>
                <label className="block text-silver text-sm mb-1">
                  <FontAwesomeIcon icon={faList} className="mr-2" />
                  Ingredients
                </label>
                <input
                  type="text"
                  name="ingrediants"
                  value={formData.ingrediants}
                  onChange={handleInputChange}
                  className={`w-full bg-deep-space/50 border rounded-lg px-3 py-2 text-silver text-sm focus:border-electric-purple focus:ring-1 focus:ring-electric-purple outline-none ${errors.ingrediants ? 'border-red-500' : 'border-silver/30'}`}
                  required
                />
                {errors.ingrediants && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-red-500 text-xs mt-1 flex items-center"
                  >
                    <FontAwesomeIcon icon={faExclamationCircle} className="mr-1" size="sm" />
                    {errors.ingrediants}
                  </motion.p>
                )}
              </div>

              <div>
                <label className="block text-silver text-sm mb-1">
                  <FontAwesomeIcon icon={faTag} className="mr-2" />
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full bg-deep-space/50 border border-silver/30 rounded-lg px-3 py-2 text-silver text-sm focus:border-electric-purple focus:ring-1 focus:ring-electric-purple outline-none"
                  required
                >
                  {availableCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="md:col-span-3 mt-4">
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full bg-scarlet hover:bg-amber text-white font-semibold py-2 rounded-lg transition-colors duration-300 flex items-center justify-center space-x-2 text-sm ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <FontAwesomeIcon icon={faUtensils} className="text-black" />
                <span className="text-black">
                  {loading ? 'Adding...' : 'Add Food Item'}
                </span>
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AddFood;
