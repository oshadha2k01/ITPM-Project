import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFilm,
  faUpload,
  faCalendar,
  faUser,
  faUsers,
  faLink,
  faToggleOn,
  faTimes,
  faExclamationCircle,
  faClock,
  faTheaterMasks
} from '@fortawesome/free-solid-svg-icons';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import AdminNavbar from '../../navbar/AdminNavbar';

const MovieForm = () => {
  const [formData, setFormData] = useState({
    movie_name: '',
    description: '',
    release_date: '',
    director: '',
    cast: '',
    trailer_link: '',
    status: '',
    image_name: null,
    show_times: [],
    genre: ''
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = !!id;
  const availableShowTimes = ['9:00 AM', '11:30 AM', '2:00 PM', '4:30 PM', '7:00 PM', '9:30 PM'];
  const availableGenres = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Animation', 'Thriller', 'Romance',
    'Documentary', 'Family', 'Fantasy', 'Mystery'];

  // Real-time validation functions
  const validateDirector = (value) => {
    const regex = /^[A-Za-z\s]*$/;
    return regex.test(value);
  };

  const validateCast = (value) => {
    const regex = /^[A-Za-z\s,]*$/;
    return regex.test(value);
  };

  const validateDescription = (value) => {
    return value.trim().length > 0;
  };

  const validateGenre = (value) => {
    return value.trim().length > 0;
  };

  const validateTrailerLink = (value) => {
    return value.trim().length > 0 && /^https?:\/\/.+/.test(value);
  };

  const calculateStatus = (releaseDate) => {
    const currentDate = new Date();
    const releaseDateObj = new Date(releaseDate);
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(currentDate.getMonth() + 1);
    const fourMonthsFromRelease = new Date(releaseDateObj);
    fourMonthsFromRelease.setMonth(releaseDateObj.getMonth() + 4);

    if (releaseDateObj > currentDate && releaseDateObj <= oneMonthFromNow) return 'Upcoming';
    if (releaseDateObj <= currentDate && currentDate <= fourMonthsFromRelease) return 'Now Showing';
    if (currentDate > fourMonthsFromRelease) return 'End';
    return 'Upcoming';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Upcoming': return 'bg-blue-500/20 text-blue-400';
      case 'Now Showing': return 'bg-green-500/20 text-green-400';
      case 'End': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const handleDateChange = (e) => {
    const { value } = e.target;
    const status = calculateStatus(value);
    setFormData(prev => ({ ...prev, release_date: value, status }));
    if (value) setErrors(prev => ({ ...prev, release_date: '' }));
    else setErrors(prev => ({ ...prev, release_date: 'Release date is required' }));
  };

  const areShowTimesValid = (times) => {
    if (times.length !== 2) return false;
    const timeToMinutes = (time) => {
      const [hourStr, period] = time.split(' ');
      let [hours, minutes] = hourStr.split(':').map(Number);
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };
    const time1 = timeToMinutes(times[0]);
    const time2 = timeToMinutes(times[1]);
    return Math.abs(time1 - time2) >= 180;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.movie_name.trim()) newErrors.movie_name = 'Movie name is required';
    else if (formData.movie_name.length < 2) newErrors.movie_name = 'Movie name must be at least 2 characters';
    if (!formData.release_date) newErrors.release_date = 'Release date is required';
    if (!formData.director.trim()) newErrors.director = 'Director name is required';
    else if (!validateDirector(formData.director)) newErrors.director = 'Director name must contain only letters';
    if (!formData.cast.trim()) newErrors.cast = 'At least one cast member is required';
    else if (!validateCast(formData.cast)) newErrors.cast = 'Cast must contain only letters and commas';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.genre) newErrors.genre = 'Genre is required';
    if (!formData.trailer_link.trim()) newErrors.trailer_link = 'Trailer link is required';
    else if (!validateTrailerLink(formData.trailer_link)) newErrors.trailer_link = 'Please enter a valid URL';
    if (!isEditMode && !formData.image_name) newErrors.image_name = 'Movie poster is required';
    if (formData.show_times.length !== 2) {
      newErrors.show_times = 'Select exactly two show times';
    } else if (!areShowTimesValid(formData.show_times)) {
      newErrors.show_times = 'Show times must be 3+ hours apart';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'director') {
      if (validateDirector(value)) {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (value.trim()) setErrors(prev => ({ ...prev, director: '' }));
        else setErrors(prev => ({ ...prev, director: 'Director name is required' }));
      } else {
        setErrors(prev => ({ ...prev, director: 'Only letters and spaces are allowed' }));
        return;
      }
    }
    
    else if (name === 'cast') {
      if (validateCast(value)) {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (value.trim()) setErrors(prev => ({ ...prev, cast: '' }));
        else setErrors(prev => ({ ...prev, cast: 'At least one cast member is required' }));
      } else {
        setErrors(prev => ({ ...prev, cast: 'Only letters, spaces, and commas are allowed' }));
        return;
      }
    }
    
    else if (name === 'description') {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (validateDescription(value)) setErrors(prev => ({ ...prev, description: '' }));
      else setErrors(prev => ({ ...prev, description: 'Description is required' }));
    }
    
    else if (name === 'genre') {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (validateGenre(value)) setErrors(prev => ({ ...prev, genre: '' }));
      else setErrors(prev => ({ ...prev, genre: 'Genre is required' }));
    }
    
    else if (name === 'trailer_link') {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (validateTrailerLink(value)) setErrors(prev => ({ ...prev, trailer_link: '' }));
      else if (!value.trim()) setErrors(prev => ({ ...prev, trailer_link: 'Trailer link is required' }));
      else setErrors(prev => ({ ...prev, trailer_link: 'Please enter a valid URL' }));
    }
    
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (name === 'movie_name') {
        if (value.trim()) setErrors(prev => ({ ...prev, movie_name: '' }));
        else setErrors(prev => ({ ...prev, movie_name: 'Movie name is required' }));
      }
      if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleShowTimeChange = (index, value) => {
    const newShowTimes = [...formData.show_times];
    newShowTimes[index] = value;
    setFormData(prev => ({ ...prev, show_times: newShowTimes.filter(Boolean) }));
    if (newShowTimes.filter(Boolean).length === 2) {
      if (areShowTimesValid(newShowTimes)) setErrors(prev => ({ ...prev, show_times: '' }));
      else setErrors(prev => ({ ...prev, show_times: 'Show times must be 3+ hours apart' }));
    } else {
      setErrors(prev => ({ ...prev, show_times: 'Select exactly two show times' }));
    }
  };

  const getAvailableOptions = (currentIndex) => {
    const otherTime = formData.show_times[currentIndex === 0 ? 1 : 0];
    if (!otherTime) return availableShowTimes;
    const otherTimeMinutes = availableShowTimes.indexOf(otherTime);
    return availableShowTimes.filter((_, i) => Math.abs(i - otherTimeMinutes) >= 2);
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

  const handleImageFile = (file) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      toast.error('Please upload a valid image (JPG, JPEG, or PNG)');
      return;
    }
    setFormData(prev => ({ ...prev, image_name: file }));
    setImagePreview(URL.createObjectURL(file));
    if (errors.image_name) setErrors(prev => ({ ...prev, image_name: '' }));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) handleImageFile(e.target.files[0]);
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image_name: null }));
    setImagePreview(null);
    if (!isEditMode) setErrors(prev => ({ ...prev, image_name: 'Movie poster is required' }));
  };

  const fetchMovieData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/movies/${id}`);
      const data = await response.json();
      if (data.data) {
        const movie = data.data;
        setFormData({
          movie_name: movie.movie_name || '',
          release_date: movie.release_date ? new Date(movie.release_date).toISOString().split('T')[0] : '',
          director: movie.director || '',
          cast: movie.cast ? movie.cast.join(', ') : '',
          trailer_link: movie.trailer_link || '',
          description: movie.description || '',
          image_name: movie.image_name || null,
          status: movie.status || '',
          show_times: movie.show_times || [],
          genre: movie.genre || ''
        });
      setImagePreview(movie.image_name ? `${import.meta.env.VITE_API_BASE_URL}/uploads/${movie.image_name}` : null);
      } else {
        throw new Error('Movie not found');
      }
    } catch (error) {
      console.error('Error fetching movie:', error);
      toast.error('Failed to fetch movie data');
      navigate('/admin/movies');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading(isEditMode ? 'Updating movie...' : 'Adding movie...');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('movie_name', formData.movie_name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('release_date', formData.release_date);
      formDataToSend.append('director', formData.director);
      
      const castArray = formData.cast
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);
      castArray.forEach(cast => formDataToSend.append('cast[]', cast));
      
      formDataToSend.append('trailer_link', formData.trailer_link);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('show_times', JSON.stringify(formData.show_times));
      formDataToSend.append('genre', formData.genre);
      
      if (formData.image_name instanceof File) {
        formDataToSend.append('image_name', formData.image_name);
      }

      const url = isEditMode
        ? `${import.meta.env.VITE_API_BASE_URL}/api/movies/${id}`
        : `${import.meta.env.VITE_API_BASE_URL}/api/movies`;
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formDataToSend
      });

      const data = await response.json();

      if (data.success || data.message === 'Movie updated successfully') {
        toast.success(isEditMode ? 'Movie updated successfully!' : 'Movie added successfully!', { id: loadingToast });
        navigate('/admin/movies');
      } else {
        throw new Error(data.error || 'Failed to save movie');
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} movie:`, error);
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

  useEffect(() => {
    if (id) fetchMovieData();
  }, [id]);

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
            <FontAwesomeIcon icon={faFilm} className="text-amber text-2xl mr-3" />
            <h2 className="text-xl md:text-2xl font-bold text-amber">
              {isEditMode ? 'Edit Movie' : 'Add New Movie'}
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
                  ${errors.image_name ? 'border-red-500' : ''}`}
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
                      <p className="text-silver text-sm">Upload poster</p>
                      <p className="text-silver/60 text-xs">Max: 5MB</p>
                    </div>
                  )}
                  <input
                    type="file"
                    name="image_name"
                    onChange={handleImageChange}
                    accept="image/jpeg,image/png,image/jpg"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                {errors.image_name && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-red-500 text-xs mt-1 flex items-center"
                  >
                    <FontAwesomeIcon icon={faExclamationCircle} className="mr-1" size="sm" />
                    {errors.image_name}
                  </motion.p>
                )}
              </div>

              <div>
                <label className="block text-silver text-sm mb-1">
                  <FontAwesomeIcon icon={faFilm} className="mr-2" />
                  Movie Name *
                </label>
                <input
                  type="text"
                  name="movie_name"
                  value={formData.movie_name}
                  onChange={handleInputChange}
                  className={`w-full bg-deep-space/50 border rounded-lg px-3 py-2 text-silver text-sm focus:border-electric-purple focus:ring-1 focus:ring-electric-purple outline-none ${errors.movie_name ? 'border-red-500' : 'border-silver/30'}`}
                  
                />
                {errors.movie_name && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-red-500 text-xs mt-1 flex items-center"
                  >
                    <FontAwesomeIcon icon={faExclamationCircle} className="mr-1" size="sm" />
                    {errors.movie_name}
                  </motion.p>
                )}
              </div>

              <div>
                <label className="block text-silver text-sm mb-1">
                  <FontAwesomeIcon icon={faUser} className="mr-2" />
                  Director *
                </label>
                <input
                  type="text"
                  name="director"
                  value={formData.director}
                  onChange={handleInputChange}
                  className={`w-full bg-deep-space/50 border rounded-lg px-3 py-2 text-silver text-sm focus:border-electric-purple focus:ring-1 focus:ring-electric-purple outline-none ${errors.director ? 'border-red-500' : 'border-silver/30'}`}
                  placeholder="Enter director name (letters only)"
                 
                />
                {errors.director && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-red-500 text-xs mt-1 flex items-center"
                  >
                    <FontAwesomeIcon icon={faExclamationCircle} className="mr-1" size="sm" />
                    {errors.director}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-4">
              <div>
                <label className="block text-silver text-sm mb-1">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="2"
                  className={`w-full bg-deep-space/50 border rounded-lg px-3 py-2 text-silver text-sm focus:border-electric-purple focus:ring-1 focus:ring-electric-purple outline-none resize-none ${errors.description ? 'border-red-500' : 'border-silver/30'}`}
                  
                />
                {errors.description && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-red-500 text-xs mt-1 flex items-center"
                  >
                    <FontAwesomeIcon icon={faExclamationCircle} className="mr-1" size="sm" />
                    {errors.description}
                  </motion.p>
                )}
              </div>

              <div>
                <label className="block text-silver text-sm mb-1">
                  <FontAwesomeIcon icon={faCalendar} className="mr-2" />
                  Release Date *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="release_date"
                    value={formData.release_date}
                    onChange={handleDateChange}
                    className={`w-full bg-deep-space/50 border rounded-lg px-3 py-2 text-silver text-sm focus:border-electric-purple focus:ring-1 focus:ring-electric-purple outline-none ${errors.release_date ? 'border-red-500' : 'border-silver/30'} custom-date-input`}
                  
                  />
                  {formData.release_date && (
                    <div className="absolute right-0 top-0 h-full flex items-center pr-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(formData.status)}`}>
                        {formData.status}
                      </span>
                    </div>
                  )}
                </div>
                {errors.release_date && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-red-500 text-xs mt-1 flex items-center"
                  >
                    <FontAwesomeIcon icon={faExclamationCircle} className="mr-1" size="sm" />
                    {errors.release_date}
                  </motion.p>
                )}
              </div>

              <div>
                <label className="block text-silver text-sm mb-1">
                  <FontAwesomeIcon icon={faUsers} className="mr-2" />
                  Cast (comma-separated) *
                </label>
                <input
                  type="text"
                  name="cast"
                  value={formData.cast}
                  onChange={handleInputChange}
                  placeholder="Actor One, Actor Two"
                  className={`w-full bg-deep-space/50 border rounded-lg px-3 py-2 text-silver text-sm focus:border-electric-purple focus:ring-1 focus:ring-electric-purple outline-none ${errors.cast ? 'border-red-500' : 'border-silver/30'}`}
                 
                />
                {errors.cast && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-red-500 text-xs mt-1 flex items-center"
                  >
                    <FontAwesomeIcon icon={faExclamationCircle} className="mr-1" size="sm" />
                    {errors.cast}
                  </motion.p>
                )}
              </div>

              <div>
                <label className="block text-silver text-sm mb-1">
                  <FontAwesomeIcon icon={faToggleOn} className="mr-2" />
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={`w-full bg-deep-space/50 border rounded-lg px-3 py-2 text-silver text-sm focus:border-electric-purple focus:ring-1 focus:ring-electric-purple outline-none ${errors.status ? 'border-red-500' : 'border-silver/30'}`}
                 
                >
                  <option value="">Select Status</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Now Showing">Now Showing</option>
                  <option value="End">End</option>
                </select>
              </div>
            </div>

            {/* Column 3 */}
            <div className="space-y-4">
              <div>
                <label className="block text-silver text-sm mb-1">
                  <FontAwesomeIcon icon={faLink} className="mr-2" />
                  Trailer Link *
                </label>
                <input
                  type="url"
                  name="trailer_link"
                  value={formData.trailer_link}
                  onChange={handleInputChange}
                  placeholder="https://..."
                  className={`w-full bg-deep-space/50 border rounded-lg px-3 py-2 text-silver text-sm focus:border-electric-purple focus:ring-1 focus:ring-electric-purple outline-none ${errors.trailer_link ? 'border-red-500' : 'border-silver/30'}`}
                 
                />
                {errors.trailer_link && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-red-500 text-xs mt-1 flex items-center"
                  >
                    <FontAwesomeIcon icon={faExclamationCircle} className="mr-1" size="sm" />
                    {errors.trailer_link}
                  </motion.p>
                )}
              </div>

              <div>
                <label className="block text-silver text-sm mb-1">
                  <FontAwesomeIcon icon={faTheaterMasks} className="mr-2" />
                  Genre *
                </label>
                <select
                  name="genre"
                  value={formData.genre}
                  onChange={handleInputChange}
                  className={`w-full bg-deep-space/50 border rounded-lg px-3 py-2 text-silver text-sm focus:border-electric-purple focus:ring-1 focus:ring-electric-purple outline-none ${errors.genre ? 'border-red-500' : 'border-silver/30'}`}
                  
                >
                  <option value="">Select Genre</option>
                  {availableGenres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
                {errors.genre && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-red-500 text-xs mt-1 flex items-center"
                  >
                    <FontAwesomeIcon icon={faExclamationCircle} className="mr-1" size="sm" />
                    {errors.genre}
                  </motion.p>
                )}
              </div>

              <div>
                <label className="block text-silver text-sm mb-1">
                  <FontAwesomeIcon icon={faClock} className="mr-2" />
                  Show Times (Select 2) *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[0, 1].map(index => (
                    <select
                      key={index}
                      value={formData.show_times[index] || ''}
                      onChange={(e) => handleShowTimeChange(index, e.target.value)}
                      className={`w-full bg-deep-space/50 border rounded-lg px-3 py-2 text-silver text-sm focus:border-electric-purple focus:ring-1 focus:ring-electric-purple outline-none ${errors.show_times ? 'border-red-500' : 'border-silver/30'}`}
                      
                    >
                      <option value="">Select</option>
                      {getAvailableOptions(index).map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  ))}
                </div>
                {errors.show_times && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-red-500 text-xs mt-1 flex items-center"
                  >
                    <FontAwesomeIcon icon={faExclamationCircle} className="mr-1" size="sm" />
                    {errors.show_times}
                  </motion.p>
                )}
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
                <FontAwesomeIcon icon={faFilm} className="text-black" />
                <span className="text-black">
                  {loading ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Update Movie' : 'Add Movie')}
                </span>
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default MovieForm;