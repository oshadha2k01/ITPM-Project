import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import MovieBuddyNavBar from '../../navbar/MovieBuddyNavBar';
import { 
  faUser, 
  faCalendar, 
  faClock, 
  faFilm,
  faArrowRight,
  faArrowLeft,
  faUserSecret,
  faEnvelope,
  faPhone
} from '@fortawesome/free-solid-svg-icons';
import { Switch } from '@headlessui/react';

const MovieBuddyForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state;
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: bookingData?.name || '',
    email: bookingData?.email || '',
    age: '',
    gender: '',
    preferredGroupSize: '1-2',
    moviePreferences: []
  });

  const [step, setStep] = useState(1);
  const [agreed, setAgreed] = useState(false);
  const [privacySettings, setPrivacySettings] = useState({
    showName: true,
    showEmail: false,
    showPhone: true,
    petName: ''
  });

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      setFormData(prev => ({
        ...prev,
        email: userEmail
      }));
    }
  }, []);

  const movieGenres = [
    'Action', 'Comedy', 'Drama', 'Horror',
    'Sci-Fi', 'Animation', 'Thriller', 'Romance',
    'Documentary', 'Family', 'Fantasy', 'Mystery'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMoviePreferenceToggle = (genre) => {
    setFormData(prev => ({
      ...prev,
      moviePreferences: prev.moviePreferences.includes(genre)
        ? prev.moviePreferences.filter(g => g !== genre)
        : [...prev.moviePreferences, genre]
    }));
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        if (!formData.age || formData.age < 18) {
          toast.error('Please enter a valid age (18 or above)');
          return false;
        }
        if (!formData.gender) {
          toast.error('Please select your gender');
          return false;
        }
        break;
      case 2:
        if (formData.moviePreferences.length === 0) {
          toast.error('Please select at least one movie genre preference');
          return false;
        }
        break;
      case 3:
        if (!privacySettings.showName && !privacySettings.petName.trim()) {
          toast.error('Please enter a pet name if you choose not to show your real name');
          return false;
        }
        break;
      default:
        return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get user data from localStorage (from MovieBuddySignup)
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const bookingDetails = JSON.parse(localStorage.getItem('bookingDetails') || '{}');
      
      if (!userData.name || !userData.email || !userData.phone || !userData.password) {
        toast.error('User signup data not found. Please start from the beginning.');
        navigate('/movie-buddy-signup');
        return;
      }

      // Combine data from both forms
      const combinedData = {
        // From MovieBuddySignup.jsx
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        
        // From MovieBuddyForm.jsx
        age: parseInt(formData.age),
        gender: formData.gender,
        moviePreferences: formData.moviePreferences,
        privacySettings: {
          showName: privacySettings.showName,
          showEmail: privacySettings.showEmail,
          showPhone: privacySettings.showPhone,
          petName: privacySettings.showName ? '' : privacySettings.petName
        },
        
        // Movie details from booking
        movieName: bookingDetails.movieTitle || bookingData?.movieName || 'Unknown Movie',
        movieDate: bookingDetails.date || bookingData?.movieDate || new Date().toISOString().split('T')[0],
        movieTime: bookingDetails.time || bookingData?.movieTime || '00:00',
        bookingId: bookingDetails.bookingId || bookingData?.bookingId || `MB_${Date.now()}`,
        seatNumbers: bookingDetails.seats || bookingData?.seatNumbers || []
      };

      console.log('Submitting combined data:', combinedData);

      // Save to database using MovieBuddy endpoint (direct creation without User model)
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/movie-buddies/create-direct`, combinedData);
      
      // Show success message
      toast.success("Registration completed successfully!", {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#22c55e',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px'
        },
      });

      // Clean up localStorage
      localStorage.removeItem('userData');
      localStorage.setItem('tempUserEmail', userData.email);
      
      // Store movie details for login page
      localStorage.setItem('movieBuddyDetails', JSON.stringify({
        movieName: combinedData.movieName,
        movieDate: combinedData.movieDate,
        movieTime: combinedData.movieTime
      }));

      // Navigate to login page after showing success message
      setTimeout(() => {
        // Dismiss any active toasts before navigation
        toast.dismiss();
        
        navigate('/movie-buddy-login', { 
          state: {
            movieName: combinedData.movieName,
            movieDate: combinedData.movieDate,
            movieTime: combinedData.movieTime,
            registrationComplete: true
          }
        });
      }, 1500);

    } catch (error) {
      console.error("Error completing registration:", error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "Registration failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderPrivacySettings = () => (
    <div className="space-y-6 w-full">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-deep-space/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <FontAwesomeIcon icon={faUser} className="text-amber" />
              <div>
                <p className="font-semibold text-amber">Display Name</p>
                <p className="text-sm text-silver/80">Show your name to other movie-goers</p>
              </div>
            </div>
            <Switch
              checked={privacySettings.showName}
              onChange={(checked) => setPrivacySettings(prev => ({ ...prev, showName: checked }))}
              className={`${privacySettings.showName ? 'bg-amber' : 'bg-silver/20'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber focus:ring-offset-2`}
            >
              <span className={`${privacySettings.showName ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-deep-space transition-transform`}/>
            </Switch>
          </div>

          {!privacySettings.showName && (
            <div className="p-4 bg-deep-space/50 rounded-lg">
              <div className="flex items-center mb-2 space-x-3">
                <FontAwesomeIcon icon={faUserSecret} className="text-amber" />
                <p className="font-semibold text-amber">Pet Name</p>
              </div>
              <p className="text-sm text-silver/80 mb-3">Enter a fun name to be displayed to others</p>
              <input
                type="text"
                value={privacySettings.petName}
                onChange={(e) => setPrivacySettings(prev => ({ ...prev, petName: e.target.value }))}
                className="w-full px-4 py-2 bg-deep-space border border-silver/20 rounded-lg text-silver focus:outline-none focus:border-amber"
                placeholder="Enter your pet name"
                required={!privacySettings.showName}
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-deep-space/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <FontAwesomeIcon icon={faEnvelope} className="text-amber" />
              <div>
                <p className="font-semibold text-amber">Email Address</p>
                <p className="text-sm text-silver/80">Share your email with other movie-goers</p>
              </div>
            </div>
            <Switch
              checked={privacySettings.showEmail}
              onChange={(checked) => setPrivacySettings(prev => ({ ...prev, showEmail: checked }))}
              className={`${privacySettings.showEmail ? 'bg-amber' : 'bg-silver/20'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber focus:ring-offset-2`}
            >
              <span className={`${privacySettings.showEmail ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-deep-space transition-transform`}/>
            </Switch>
          </div>

          <div className="flex items-center justify-between p-4 bg-deep-space/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <FontAwesomeIcon icon={faPhone} className="text-amber" />
              <div>
                <p className="font-semibold text-amber">Phone Number</p>
                <p className="text-sm text-silver/80">Your phone number will be shared with other movie-goers</p>
              </div>
            </div>
            <div className="bg-amber relative inline-flex h-6 w-11 items-center rounded-full">
              <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-deep-space transition-transform"/>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1"
          />
          <span className="text-sm text-silver/80">
            I understand and agree that my selected preferences and information will be used to find compatible movie buddies.
            I can modify these settings at any time.
          </span>
        </label>
      </div>
    </div>
  );

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-deep-space text-silver flex items-center justify-center">
        <div className="text-2xl text-amber">Invalid access. Please complete a booking first.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-space text-silver py-12">
      <MovieBuddyNavBar />
      <Toaster position="top-right" />
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto"
        >
          <div className="bg-electric-purple/10 rounded-xl p-8 border border-silver/10 shadow-lg">
            <div className="flex justify-between mb-8">
              {[1, 2, 3].map((stepNumber) => (
                <div
                  key={stepNumber}
                  className={`flex items-center ${stepNumber < 3 ? 'flex-1' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step >= stepNumber ? 'bg-amber text-deep-space' : 'bg-deep-space/50 text-silver'
                    }`}
                  >
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        step > stepNumber ? 'bg-amber' : 'bg-deep-space/50'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="mb-8 p-6 bg-deep-space/50 rounded-lg">
              <h2 className="text-xl font-bold text-amber mb-4">Your Movie Details</h2>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-silver/80">Movie</p>
                  <p className="text-amber font-semibold">{bookingData.movieName}</p>
                </div>
                <div>
                  <p className="text-silver/80">Date</p>
                  <p className="text-amber font-semibold">{bookingData.movieDate}</p>
                </div>
                <div>
                  <p className="text-silver/80">Time</p>
                  <p className="text-amber font-semibold">{bookingData.movieTime}</p>
                </div>
              </div>
            </div>

            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-amber">Demographics</h2>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-lg font-semibold text-amber mb-2">Age</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      min="18"
                      className="w-full px-4 py-2 bg-deep-space border border-silver/20 rounded-lg text-silver focus:outline-none focus:border-amber"
                      placeholder="Enter your age"
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-semibold text-amber mb-2">Gender</label>
                    <div className="flex space-x-6">
                      {['Male', 'Female', 'Other'].map((gender) => (
                        <button
                          key={gender}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, gender }))}
                          className={`px-6 py-2 rounded-lg flex items-center ${
                            formData.gender === gender
                              ? 'bg-amber text-deep-space'
                              : 'bg-deep-space/50 text-silver hover:bg-deep-space/70'
                          }`}
                        >
                          <FontAwesomeIcon icon={faUser} className="mr-2" />
                          {gender}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="bg-amber text-deep-space px-6 py-2 rounded-lg hover:bg-amber/80 flex items-center"
                  >
                    Next
                    <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-amber">Movie Preferences</h2>
                <p className="text-silver">Select your favorite movie genres:</p>
                <div className="grid grid-cols-4 gap-4">
                  {movieGenres.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => handleMoviePreferenceToggle(genre)}
                      className={`px-4 py-2 rounded-lg text-center ${
                        formData.moviePreferences.includes(genre)
                          ? 'bg-amber text-deep-space'
                          : 'bg-deep-space/50 text-silver hover:bg-deep-space/70'
                      }`}
                    >
                      <FontAwesomeIcon icon={faFilm} className="mr-2" />
                      {genre}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between">
                  <button
                    onClick={handleBack}
                    className="bg-deep-space/50 text-silver px-6 py-2 rounded-lg hover:bg-deep-space/70 flex items-center"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    className="bg-amber text-deep-space px-6 py-2 rounded-lg hover:bg-amber/80 flex items-center"
                  >
                    Next
                    <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-amber">Privacy Settings</h2>
                {renderPrivacySettings()}
                <div className="flex justify-between">
                  <button
                    onClick={handleBack}
                    className="bg-deep-space/50 text-silver px-6 py-2 rounded-lg hover:bg-deep-space/70 flex items-center"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!agreed || loading}
                    className={`px-6 py-2 rounded-lg flex items-center ${
                      agreed && !loading
                        ? 'bg-amber text-deep-space hover:bg-amber/80'
                        : 'bg-deep-space/50 text-silver/50 cursor-not-allowed'
                    }`}
                  >
                    {loading ? 'Completing Registration...' : 'Complete Registration'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MovieBuddyForm;
