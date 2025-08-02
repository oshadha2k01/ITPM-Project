import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faPhone, faEyeSlash, faArrowLeft, faVenusMars, faBirthdayCake, faTicketAlt, faCalendarAlt, faClock, faChair } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import MovieBuddyNavBar from '../../navbar/MovieBuddyNavBar';

const MovieBuddyProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const email = localStorage.getItem('userEmail');
      if (!email) {
        toast.error('Please log in to view your profile');
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        // Fetch user profile from users collection
        const API_BASE = import.meta.env.VITE_API_BASE_URL;
        const userResponse = await axios.get(`${API_BASE}/api/users/profile?email=${email}`);
        if (!userResponse.data || !userResponse.data.name) {
          throw new Error('User profile not found');
        }

        // Fetch movie buddy data for the logged-in user
        const buddyResponse = await axios.get(`${API_BASE}/api/movie-buddies/profile?email=${email}`);
        
        setUserData({
          ...userResponse.data,
          movieBuddy: buddyResponse.data || null,
        });
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error(error.response?.data?.message || 'Failed to load profile');
        navigate('/movie-buddies');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-space text-silver flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber"></div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-deep-space text-silver">
      <MovieBuddyNavBar />
      <div className="container mx-auto px-4 pt-24 pb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/movie-buddies')}
            className="mb-6 flex items-center text-amber hover:text-amber/80 transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back to Movie Buddies
          </button>

          <div className="bg-electric-purple/10 rounded-xl p-8 border border-silver/10 shadow-lg">
            {/* Movie Details (if available) */}
            {userData.movieBuddy && (
              <div className="bg-electric-purple/20 rounded-lg p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3">
                    <FontAwesomeIcon icon={faTicketAlt} className="text-amber text-xl" />
                    <div>
                      <p className="text-silver/75">Movie</p>
                      <p className="text-xl font-semibold text-amber">{userData.movieBuddy.movieName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-amber text-xl" />
                    <div>
                      <p className="text-silver/75">Date</p>
                      <p className="text-xl font-semibold text-amber">{formatDate(userData.movieBuddy.movieDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FontAwesomeIcon icon={faClock} className="text-amber text-xl" />
                    <div>
                      <p className="text-silver/75">Time</p>
                      <p className="text-xl font-semibold text-amber">{userData.movieBuddy.movieTime}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Details */}
            <div className="bg-electric-purple/20 rounded-lg p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-4 rounded-full bg-electric-purple/20">
                  <FontAwesomeIcon icon={faUser} className="text-electric-purple text-2xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-amber">{userData.name}</h2>
                  <p className="text-silver/75">Movie Buddy</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-amber">Personal Information</h3>
                  <div className="space-y-3">
                    {userData.age && (
                      <div className="flex items-center space-x-3">
                        <FontAwesomeIcon icon={faBirthdayCake} className="text-amber" />
                        <div>
                          <p className="text-silver/75 text-sm">Age</p>
                          <p className="text-silver">{userData.age}</p>
                        </div>
                      </div>
                    )}
                    {userData.gender && (
                      <div className="flex items-center space-x-3">
                        <FontAwesomeIcon icon={faVenusMars} className="text-amber" />
                        <div>
                          <p className="text-silver/75 text-sm">Gender</p>
                          <p className="text-silver">{userData.gender}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-amber">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <FontAwesomeIcon icon={faEnvelope} className="text-amber" />
                      <div>
                        <p className="text-silver/75 text-sm">Email</p>
                        <p className="text-silver">{userData.email}</p>
                      </div>
                    </div>
                    {userData.phone && (
                      <div className="flex items-center space-x-3">
                        <FontAwesomeIcon icon={faPhone} className="text-amber" />
                        <div>
                          <p className="text-silver/75 text-sm">Phone</p>
                          <p className="text-silver">{userData.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {userData.movieBuddy && (
                  <>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-amber">Booking Information</h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <FontAwesomeIcon icon={faCalendarAlt} className="text-amber" />
                          <div>
                            <p className="text-silver/75 text-sm">Booked On</p>
                            <p className="text-silver">{formatDate(userData.movieBuddy.bookingDate)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-amber">Seat Information</h3>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(userData.movieBuddy.seatNumbers) &&
                          userData.movieBuddy.seatNumbers.map((seat, index) => (
                            <span
                              key={index}
                              className="bg-amber/20 text-amber px-3 py-1 rounded-full text-sm flex items-center"
                            >
                              <FontAwesomeIcon icon={faChair} className="mr-2" />
                              {seat}
                            </span>
                          ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MovieBuddyProfile;
