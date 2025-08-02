import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTheaterMasks, faCalendar, faClock, faChair, faUser, faEnvelope, faPhone, faExclamationCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Toaster, toast } from 'react-hot-toast';
import MainNavBar from '../../navbar/MainNavBar';
import axios from 'axios';
import SeatSelection from './SeatSelection';

const BookingForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [formData, setFormData] = useState({
    movieDate: '',
    movieTime: '',
    seatNumbers: [],
    name: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [movieData, setMovieData] = useState({
    movie_name: '',
    show_times: []
  });
  const [seatSelectionOpen, setSeatSelectionOpen] = useState(false);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [filteredShowTimes, setFilteredShowTimes] = useState([]);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        let movie;
        if (location.state?.movieData) {
          movie = {
            movie_name: location.state.movieData.movie_name,
            show_times: location.state.movieData.show_times || []
          };
        } else {
          const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/movies/${id}`);
          movie = {
            movie_name: response.data.movie_name,
            show_times: response.data.show_times || []
          };
        }
        setMovieData(movie);
        filterShowTimes(movie.show_times, formData.movieDate);
      } catch (error) {
        console.error('Error fetching movie data:', error);
        toast.error('Failed to load movie data');
        navigate('/now-showing');
      }
    };
    fetchMovieData();
  }, [id, navigate, location.state]);

  useEffect(() => {
    filterShowTimes(movieData.show_times, formData.movieDate);
  }, [formData.movieDate, movieData.show_times]);

  const filterShowTimes = (showTimes, selectedDate) => {
    if (!showTimes || showTimes.length === 0) {
      setFilteredShowTimes([]);
      return;
    }

    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();

    let validTimes = showTimes;

    if (selectedDate === currentDate) {
      validTimes = showTimes.filter((time) => {
        const [timeStr, period] = time.split(' ');
        let [hours, minutes] = timeStr.split(':').map(Number);
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        const showTimeInMinutes = hours * 60 + minutes;
        const currentTimeInMinutes = currentHours * 60 + currentMinutes;
        return showTimeInMinutes > currentTimeInMinutes;
      });
    }

    setFilteredShowTimes(validTimes);

    // Reset movieTime if it's no longer valid
    if (formData.movieTime && !validTimes.includes(formData.movieTime)) {
      setFormData((prev) => ({ ...prev, movieTime: validTimes[0] || '' }));
    }
  };

  useEffect(() => {
    const fetchBookedSeats = async () => {
      if (formData.movieDate && formData.movieTime) {
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/bookings/booked-seats`, {
            params: { movieId: id, date: formData.movieDate, time: formData.movieTime }
          });
          setBookedSeats(response.data.bookedSeats || []);
          setSelectedSeats([]);
        } catch (error) {
          console.error('Error fetching booked seats:', error);
          toast.error('Failed to load booked seats');
        }
      }
    };
    fetchBookedSeats();
  }, [formData.movieDate, formData.movieTime, id]);

  const validateInput = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'name':
        if (/[^a-zA-Z\s]/.test(value)) {
          newErrors.name = 'Please use letters only';
        } else if (value.trim() === '') {
          newErrors.name = 'Name is required';
        } else if (value.length < 2) {
          newErrors.name = 'Name must be at least 2 characters';
        } else {
          delete newErrors.name;
        }
        break;

      case 'email':
        if (!/^[a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]*\.[a-zA-Z]{0,}$/.test(value)) {
          newErrors.email = 'Invalid email format';
        } else if (value.trim() === '') {
          newErrors.email = 'Email is required';
        } else {
          delete newErrors.email;
        }
        break;

      case 'phone':
        if (/[^0-9]/.test(value)) {
          newErrors.phone = 'Please use numbers only';
        } else if (value.length > 10) {
          newErrors.phone = 'Maximum 10 digits allowed';
        } else if (value.trim() === '') {
          newErrors.phone = 'Phone number is required';
        } else if (value.length < 10 && value.length > 0) {
          newErrors.phone = 'Phone number must be 10 digits';
        } else {
          delete newErrors.phone;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 || !newErrors[name];
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    switch (name) {
      case 'name':
        if (/[^a-zA-Z\s]/.test(value)) {
          return;
        }
        break;
      case 'phone':
        if (/[^0-9]/.test(value) || value.length > 10) {
          return;
        }
        break;
      default:
        break;
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));
    validateInput(name, newValue);

    if (name === 'movieDate' || name === 'movieTime') {
      setSelectedSeats([]);
    }
  };

  const handleSeatSelect = (seats) => {
    setSelectedSeats(seats);
    setFormData({ ...formData, seatNumbers: seats });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.movieDate) newErrors.movieDate = 'Please select a date';
    if (!formData.movieTime) newErrors.movieTime = 'Please select a show time';
    if (selectedSeats.length === 0) newErrors.seatNumber = 'Please select at least one seat';
    if (selectedSeats.some((seat) => bookedSeats.includes(seat))) {
      newErrors.seatNumber = 'Some selected seats are already booked';
    }
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/bookings`, {
        movieName: movieData.movie_name,
        movieDate: formData.movieDate,
        movieTime: formData.movieTime,
        seatNumbers: formData.seatNumbers,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        movie_id: id
      });

      toast.success('Booking confirmed successfully!');
      navigate(`/booking-details/${response.data._id}`);
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-deep-space text-silver flex items-center justify-center py-12">
      <MainNavBar />
      <div className="container mx-auto px-4">
        <Toaster position="top-right" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-electric-purple/10 rounded-xl p-8 border border-silver/10 shadow-lg">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-amber">Book Tickets</h1>
              <div className="flex items-center text-silver bg-deep-space/50 px-4 py-2 rounded-lg">
                <FontAwesomeIcon icon={faTheaterMasks} className="mr-2 text-amber" />
                <span className="font-medium">{movieData.movie_name}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-amber mb-6 pb-2 border-b border-silver/20">Movie Details</h2>
                  
                  <style jsx>{`
                    .calendar-white::-webkit-calendar-picker-indicator {
                      filter: invert(100%);
                    }
                  `}</style>

                  <div>
                    <label className="block text-sm font-medium text-silver mb-2">
                      <FontAwesomeIcon icon={faCalendar} className="mr-2 text-amber" />
                      Select Date
                    </label>
                    <input
                      type="date"
                      name="movieDate"
                      value={formData.movieDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2.5 bg-deep-space border border-silver/20 rounded-lg text-silver focus:outline-none focus:border-amber calendar-white"
                    />
                    {errors.movieDate && (
                      <p className="mt-1 text-sm text-scarlet flex items-center">
                        <FontAwesomeIcon icon={faExclamationCircle} className="mr-1" />
                        {errors.movieDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-silver mb-2">
                      <FontAwesomeIcon icon={faClock} className="mr-2 text-amber" />
                      Select Show Time
                    </label>
                    <select
                      name="movieTime"
                      value={formData.movieTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-deep-space border border-silver/20 rounded-lg text-silver focus:outline-none focus:border-amber"
                    >
                      <option value="">Select a time</option>
                      {filteredShowTimes.map((time, index) => (
                        <option key={index} value={time}>{time}</option>
                      ))}
                    </select>
                    {errors.movieTime && (
                      <p className="mt-1 text-sm text-scarlet flex items-center">
                        <FontAwesomeIcon icon={faExclamationCircle} className="mr-1" />
                        {errors.movieTime}
                      </p>
                    )}
                    {filteredShowTimes.length === 0 && formData.movieDate && (
                      <p className="mt-1 text-sm text-scarlet flex items-center">
                        <FontAwesomeIcon icon={faExclamationCircle} className="mr-1" />
                        No show times available for this date
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-silver mb-2">
                      <FontAwesomeIcon icon={faChair} className="mr-2 text-amber" />
                      Select Seats
                    </label>
                    <div
                      onClick={() => {
                        if (!formData.movieDate || !formData.movieTime) {
                          toast.error('Please select date and time first');
                          return;
                        }
                        setSeatSelectionOpen(true);
                      }}
                      className="w-full px-4 py-2.5 bg-deep-space border border-silver/20 rounded-lg text-silver cursor-pointer hover:border-amber transition-colors duration-200"
                    >
                      {selectedSeats.length > 0 
                        ? `${selectedSeats.length} seat${selectedSeats.length > 1 ? 's' : ''} selected: ${selectedSeats.join(', ')}`
                        : 'Click to select seats'}
                    </div>
                    {errors.seatNumber && (
                      <p className="mt-1 text-sm text-scarlet flex items-center">
                        <FontAwesomeIcon icon={faExclamationCircle} className="mr-1" />
                        {errors.seatNumber}
                      </p>
                    )}
                  </div>
                </div>



                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-amber mb-6 pb-2 border-b border-silver/20">Personal Details</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-silver mb-2">
                      <FontAwesomeIcon icon={faUser} className="mr-2 text-amber" />
                      Your Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-deep-space border border-silver/20 rounded-lg text-silver focus:outline-none focus:border-amber"
                      placeholder="Enter your name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-scarlet flex items-center">
                        <FontAwesomeIcon icon={faExclamationCircle} className="mr-1" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-silver mb-2">
                      <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-amber" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-deep-space border border-silver/20 rounded-lg text-silver focus:outline-none focus:border-amber"
                      placeholder="example@domain.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-scarlet flex items-center">
                        <FontAwesomeIcon icon={faExclamationCircle} className="mr-1" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-silver mb-2">
                      <FontAwesomeIcon icon={faPhone} className="mr-2 text-amber" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      maxLength={10}
                      className="w-full px-4 py-2.5 bg-deep-space border border-silver/20 rounded-lg text-silver focus:outline-none focus:border-amber"
                      placeholder="Enter phone number"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-scarlet flex items-center">
                        <FontAwesomeIcon icon={faExclamationCircle} className="mr-1" />
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-silver/20">
                <button
                  type="button"
                  onClick={() => navigate('/now-showing')}
                  className="px-6 py-2.5 bg-deep-space/50 text-silver hover:bg-deep-space/70 rounded-lg transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-scarlet hover:bg-amber text-white rounded-lg transition-colors duration-300 flex items-center"
                >
                  {loading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                      Processing...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>

      <SeatSelection
        isOpen={seatSelectionOpen}
        onClose={() => setSeatSelectionOpen(false)}
        onSelect={handleSeatSelect}
        selectedSeats={selectedSeats}
        bookedSeats={bookedSeats}
        maxSeats={4}
      />
    </div>
  );
};

export default BookingForm;