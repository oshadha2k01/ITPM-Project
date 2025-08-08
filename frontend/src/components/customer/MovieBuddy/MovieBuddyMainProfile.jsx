import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser,
  faEnvelope, 
  faPhone, 
  faFilm, 
  faCalendar, 
  faClock,
  faChair,
  faEdit,
  faTrash,
  faSignOutAlt,
  faTimes,
  faSave,
  faHeart,
  faVenusMars,
  faBirthdayCake,
  faTicketAlt,
  faUserSecret,
  faExclamationTriangle,
  faUsers,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const MovieBuddyMainProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [personalInfo, setPersonalInfo] = useState(null);
  const [movieDetails, setMovieDetails] = useState(null);
  const [preferences, setPreferences] = useState(null);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const getUserDataByEmail = async (email) => {
    try {
      const response = await axios.post('http://localhost:3000/api/movie-buddies/email', { email });
      if (response.data.success && response.data.data.length > 0) {
        return response.data.data[0];
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data by email:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        
        // Get user info from localStorage
        const userEmail = localStorage.getItem('userEmail');
        
        if (!userEmail) {
          setError('You must be logged in to view your profile');
          setLoading(false);
          return;
        }
        
        // Fetch user details from Auth/UserModel
        try {
          const userResponse = await axios.get(`http://localhost:3000/api/auth/user`, {
            params: { email: userEmail }
          });
          
          if (userResponse.data) {
            const userData = userResponse.data.user || userResponse.data;
            const userName = localStorage.getItem('userName');
            setPersonalInfo({
              name: userData.name || userName || 'User',
              email: userData.email || userEmail,
              phone: userData.phone || 'Not provided',
              createdAt: userData.createdAt || new Date().toISOString()
            });
            
            setEditForm({
              name: userData.name || userName || 'User',
              email: userData.email || userEmail,
              phone: userData.phone || ''
            });
            
            localStorage.setItem('userName', userData.name || userName || '');
            localStorage.setItem('userPhone', userData.phone || '');
          }
        } catch (userError) {
          console.error('Error fetching user data:', userError);
          // Fallback to localStorage data
          setPersonalInfo({
            name: localStorage.getItem('userName') || 'User',
            email: userEmail,
            phone: localStorage.getItem('userPhone') || 'Not provided',
            createdAt: new Date().toISOString()
          });
        }
        
        // Fetch MovieBuddy profile using getUserDataByEmail
        try {
          const buddyData = await getUserDataByEmail(userEmail);
          
          if (buddyData) {
            setProfile(buddyData);
            
            setMovieDetails({
              movieName: buddyData.movieName || 'Not set',
              movieDate: buddyData.movieDate || 'Not set',
              movieTime: buddyData.movieTime || 'Not set',
              seatNumbers: buddyData.seatNumbers || [],
              bookingId: buddyData.bookingId || 'Not set'
            });
            
            setPreferences({
              age: buddyData.age || 'Not set',
              gender: buddyData.gender || 'Not set',
              moviePreferences: buddyData.moviePreferences || [],
              privacySettings: buddyData.privacySettings || {
                showName: true,
                showEmail: false,
                showPhone: false,
                petName: ''
              }
            });
          } else {
            // Set default empty values if no MovieBuddy profile exists
            setPreferences({
              age: 'Not set',
              gender: 'Not set',
              moviePreferences: [],
              privacySettings: {
                showName: true,
                showEmail: false,
                showPhone: false,
                petName: ''
              }
            });
          }
        } catch (buddyError) {
          console.error('Error fetching movie buddy data:', buddyError);
          // Set default empty values
          setPreferences({
            age: 'Not set',
            gender: 'Not set',
            moviePreferences: [],
            privacySettings: {
              showName: true,
              showEmail: false,
              showPhone: false,
              petName: ''
            }
          });
        }
      } catch (error) {
        console.error('General error in profile fetch:', error);
        setError('Failed to load complete profile. Some features might be limited.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleEditProfile = () => {
    // Reset the form data with current personal info before showing modal
    setEditForm({
      name: personalInfo?.name || '',
      email: personalInfo?.email || '',
      phone: personalInfo?.phone || ''
    });
    setShowEditModal(true);
  };

  const handleEditClose = () => {
    setShowEditModal(false);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    // Update the state directly without any additional validation at this point
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!editForm.name || !editForm.email || !editForm.phone) {
      toast.error('All fields are required');
      return;
    }
    
    try {
      setLoading(true);
      
      // Log the form data being submitted for debugging
      console.log('Submitting edit form data:', editForm);
      
      // Update user profile - Fix the endpoint URL
      try {
        // Changed from /api/users/update-profile to /api/auth/update
        const response = await axios.put(`http://localhost:3000/api/auth/update`, {
          email: editForm.email,
          name: editForm.name,
          phone: editForm.phone,
          oldEmail: personalInfo.email
        });
        
        console.log('Profile update response:', response.data);
      } catch (authUpdateError) {
        console.error('Error updating auth profile:', authUpdateError);
        
        // Check if it's just an endpoint issue but we can still update local state
        if (authUpdateError.response?.status === 404) {
          console.warn('Update endpoint not found. Updating local state only.');
          // Continue with local updates even if the API fails
        } else {
          throw new Error('Failed to update personal information: ' + (authUpdateError.response?.data?.message || authUpdateError.message));
        }
      }
      
      // Update MovieBuddy profile if it exists
      // Only attempt this if we have a profile ID
      if (profile && profile._id) {
        try {
          const payload = {
            name: editForm.name,
            email: editForm.email,
            phone: editForm.phone,
            // ...other payload properties remain the same
            bookingId: profile.bookingId,
            age: profile.age,
            gender: profile.gender,
            moviePreferences: profile.moviePreferences || [],
            privacySettings: profile.privacySettings || {
              showName: true,
              showEmail: false,
              showPhone: false,
              petName: ''
            },
            seatNumbers: profile.seatNumbers || [],
            movieName: profile.movieName,
            movieDate: profile.movieDate,
            movieTime: profile.movieTime
          };
          
          await axios.put(`http://localhost:3000/api/movie-buddies/${profile._id}`, payload);
        } catch (movieBuddyUpdateError) {
          console.error('Error updating movie buddy profile:', movieBuddyUpdateError);
          // Don't throw - we'll still update the UI even if movie buddy update fails
        }
      }
      
      // Always update the local state and localStorage regardless of API success
      setPersonalInfo(prev => ({
        ...prev,
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone
      }));
      
      localStorage.setItem('userEmail', editForm.email);
      localStorage.setItem('userPhone', editForm.phone);
      localStorage.setItem('userName', editForm.name);
      
      toast.success('Profile updated successfully');
      setShowEditModal(false);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('userName');
    localStorage.removeItem('authToken');
    
    toast.success('Logged out successfully');
    
    setTimeout(() => {
      navigate('/movie-buddy-login');
    }, 1000);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      
      if (profile && profile._id) {
        await axios.delete(`http://localhost:3000/api/movie-buddies/${profile._id}`);
      }
      
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userPhone');
      localStorage.removeItem('userName');
      localStorage.removeItem('authToken');
      
      toast.success('Profile deleted successfully');
      
      setTimeout(() => {
        navigate('/movie-buddy-login');
      }, 1000);
    } catch (error) {
      toast.error('Failed to delete profile. Please try again.');
      setShowDeleteConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMovieBuddyProfile = () => {
    navigate('/movie-buddy-form');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-space text-silver flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-deep-space text-silver flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl text-amber mb-4">{error}</div>
          <button
            onClick={() => navigate('/movie-buddy-login')}
            className="px-4 py-2 bg-amber text-deep-space rounded-lg hover:bg-amber/80"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (!personalInfo) {
    return (
      <div className="min-h-screen bg-deep-space text-silver flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl text-amber mb-4">No profile found</div>
          <button
            onClick={() => navigate('/movie-buddy-login')}
            className="px-4 py-2 bg-amber text-deep-space rounded-lg hover:bg-amber/80"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-space text-silver py-12">
      <Toaster position="top-right" />
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-electric-purple/10 rounded-xl p-8 border border-silver/10 shadow-lg">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-amber">My Movie Buddy Profile</h1>
              <div className="flex space-x-3">
                <button
                  onClick={handleEditProfile}
                  className="px-4 py-2 bg-amber text-deep-space rounded-lg hover:bg-amber/80 flex items-center"
                >
                  <FontAwesomeIcon icon={faEdit} className="mr-2" />
                  Edit Profile
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center"
                >
                  <FontAwesomeIcon icon={faTrash} className="mr-2" />
                  Delete Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-electric-purple/20 text-silver rounded-lg hover:bg-electric-purple/30 flex items-center"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                  Logout
                </button>
              </div>
            </div>

            <div className="bg-deep-space/50 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-amber mb-6">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faUser} className="text-amber mr-3 w-5" />
                  <div>
                    <p className="text-silver/80">Name</p>
                    <p className="text-amber font-semibold">{personalInfo.name}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faEnvelope} className="text-amber mr-3 w-5" />
                  <div>
                    <p className="text-silver/80">Email</p>
                    <p className="text-amber font-semibold">{personalInfo.email}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faPhone} className="text-amber mr-3 w-5" />
                  <div>
                    <p className="text-silver/80">Phone</p>
                    <p className="text-amber font-semibold">{personalInfo.phone}</p>
                  </div>
                </div>
                {personalInfo.createdAt && (
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faCalendar} className="text-amber mr-3 w-5" />
                    <div>
                      <p className="text-silver/80">Joined On</p>
                      <p className="text-amber font-semibold">
                        {new Date(personalInfo.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {movieDetails ? (
              <div className="bg-deep-space/50 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold text-amber mb-6">Current Movie Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faFilm} className="text-amber mr-3 w-5" />
                    <div>
                      <p className="text-silver/80">Movie</p>
                      <p className="text-amber font-semibold">{movieDetails.movieName}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faCalendar} className="text-amber mr-3 w-5" />
                    <div>
                      <p className="text-silver/80">Date</p>
                      <p className="text-amber font-semibold">{movieDetails.movieDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faClock} className="text-amber mr-3 w-5" />
                    <div>
                      <p className="text-silver/80">Time</p>
                      <p className="text-amber font-semibold">{movieDetails.movieTime}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faTicketAlt} className="text-amber mr-3 w-5" />
                    <div>
                      <p className="text-silver/80">Booking ID</p>
                      <p className="text-amber font-semibold">{movieDetails.bookingId}</p>
                    </div>
                  </div>
                </div>
                
                {movieDetails.seatNumbers && movieDetails.seatNumbers.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-amber mb-3">Your Seats</h3>
                    <div className="flex flex-wrap gap-2">
                      {movieDetails.seatNumbers.map((seat, index) => (
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
                )}
              </div>
            ) : (
              <div className="bg-deep-space/50 rounded-lg p-6 mb-6 border border-amber/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-amber mb-2">Current Movie Details</h2>
                    <p className="text-silver/80 mb-4">You haven't set up your movie buddy details yet</p>
                  </div>
                  <button
                    onClick={handleCreateMovieBuddyProfile}
                    className="px-4 py-2 bg-amber text-deep-space rounded-lg hover:bg-amber/80"
                  >
                    Set Up Now
                  </button>
                </div>
              </div>
            )}

            <div className="bg-deep-space/50 rounded-lg p-6">
              <h2 className="text-xl font-bold text-amber mb-6">Preferences & Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faBirthdayCake} className="text-amber mr-3 w-5" />
                  <div>
                    <p className="text-silver/80">Age</p>
                    <p className="text-amber font-semibold">{preferences?.age || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faVenusMars} className="text-amber mr-3 w-5" />
                  <div>
                    <p className="text-silver/80">Gender</p>
                    <p className="text-amber font-semibold">{preferences?.gender || 'Not set'}</p>
                  </div>
                </div>
              </div>
              
              {preferences?.moviePreferences && preferences.moviePreferences.length > 0 ? (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-amber mb-3">Movie Preferences</h3>
                  <div className="flex flex-wrap gap-2">
                    {preferences.moviePreferences.map((pref, index) => (
                      <span
                        key={index}
                        className="bg-electric-purple/20 text-electric-purple px-3 py-1 rounded-full text-sm flex items-center"
                      >
                        <FontAwesomeIcon icon={faHeart} className="mr-2" />
                        {pref}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-amber mb-3">Movie Preferences</h3>
                  <p className="text-silver/80">No movie preferences set</p>
                </div>
              )}
              
              {preferences?.privacySettings && (
                <div>
                  <h3 className="text-lg font-semibold text-amber mb-3">Privacy Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-deep-space p-3 rounded-lg">
                      <div>
                        <p className="text-amber font-medium">Show Real Name</p>
                        <p className="text-silver/70 text-sm">Display your real name to other movie buddies</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm ${
                        preferences.privacySettings.showName ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                      }`}>
                        {preferences.privacySettings.showName ? 'Enabled' : 'Disabled'}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between bg-deep-space p-3 rounded-lg">
                      <div>
                        <p className="text-amber font-medium">Show Email</p>
                        <p className="text-silver/70 text-sm">Let other movie buddies see your email</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm ${
                        preferences.privacySettings.showEmail ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                      }`}>
                        {preferences.privacySettings.showEmail ? 'Enabled' : 'Disabled'}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between bg-deep-space p-3 rounded-lg">
                      <div>
                        <p className="text-amber font-medium">Show Phone</p>
                        <p className="text-silver/70 text-sm">Let other movie buddies see your phone number</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm ${
                        preferences.privacySettings.showPhone ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                      }`}>
                        {preferences.privacySettings.showPhone ? 'Enabled' : 'Disabled'}
                      </div>
                    </div>
                    
                    {!preferences.privacySettings.showName && (
                      <div className="flex items-center justify-between bg-deep-space p-3 rounded-lg">
                        <div>
                          <p className="text-amber font-medium">Pet Name</p>
                          <p className="text-silver/70 text-sm">Your display name for other movie buddies</p>
                        </div>
                        <div className="px-3 py-1 bg-amber/20 text-amber rounded-full text-sm">
                          {preferences.privacySettings.petName || 'Anonymous'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {movieDetails && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => navigate('/movie-buddies')}
                  className="px-6 py-3 bg-amber text-deep-space rounded-lg hover:bg-amber/80 inline-flex items-center"
                >
                  <FontAwesomeIcon icon={faUsers} className="mr-2" />
                  View All Movie Buddies
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-deep-space p-8 rounded-xl max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-amber">Edit Profile</h2>
              <button
                onClick={handleEditClose}
                className="text-silver hover:text-amber"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-silver mb-2">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditFormChange}
                    className="w-full px-4 py-2 bg-deep-space border border-silver/20 rounded-lg text-silver focus:outline-none focus:border-amber"
                    required
                    autoComplete="off"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-silver mb-2">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditFormChange}
                    className="w-full px-4 py-2 bg-deep-space border border-silver/20 rounded-lg text-silver focus:outline-none focus:border-amber"
                    required
                    autoComplete="off"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-silver mb-2">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleEditFormChange}
                    className="w-full px-4 py-2 bg-deep-space border border-silver/20 rounded-lg text-silver focus:outline-none focus:border-amber"
                    required
                    autoComplete="off"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleEditClose}
                  className="px-4 py-2 bg-deep-space border border-silver/20 text-silver hover:border-silver/50 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber text-deep-space hover:bg-amber/90 rounded-lg flex items-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSave} className="mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-deep-space p-8 rounded-xl max-w-md w-full">
            <div className="text-center mb-6">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 text-4xl mb-4" />
              <h2 className="text-2xl font-bold text-amber mb-2">Confirm Delete</h2>
              <p className="text-silver">
                Are you sure you want to delete your Movie Buddy profile? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 bg-deep-space border border-silver/20 text-silver hover:border-silver/50 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg flex items-center"
              >
                <FontAwesomeIcon icon={faTrash} className="mr-2" />
                Delete Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieBuddyMainProfile;