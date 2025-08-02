import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faSort, 
  faChair,
  faUsers,
  faUserGroup,
  faUser,
  faSpinner,
  faCalendarAlt,
  faClock,
  faTicketAlt,
  faChartBar,
  faEnvelope,
  faPhone,
  faUserSecret,
  faEye,
  faEyeSlash,
  faFilter,
  faUserCircle,
  faUserFriends,
  faTimes,
  faIdCard,
  faPeopleGroup
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import CustomerNavBar from '../../navbar/MovieBuddyNavBar';
import MovieBuddyFilter from './MovieBuddyFilter';

const MovieBuddyList = () => {
  const navigate = useNavigate();
  const [movieBuddyGroups, setMovieBuddyGroups] = useState([]);
  const [originalMovieBuddyGroups, setOriginalMovieBuddyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('movieDate');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterOptions, setFilterOptions] = useState({
    bookingType: 'all',
    privacy: 'all',
    movieName: ''
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userMovieDetails, setUserMovieDetails] = useState(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      // Redirect to login page if not logged in
      navigate('/movie-buddy-login');
      return;
    }

    setIsAuthChecked(true);
    fetchMovieBuddyGroups();
    
    // Check for updated movie details from localStorage
    const storedMovieDetails = localStorage.getItem('userMovieDetails');
    if (storedMovieDetails) {
      try {
        const movieDetails = JSON.parse(storedMovieDetails);
        setUserMovieDetails(movieDetails);
        // Clear the stored details after using them
        localStorage.removeItem('userMovieDetails');
      } catch (error) {
        console.error('Error parsing stored movie details:', error);
      }
    }
  }, [navigate]);

  const fetchMovieBuddyGroups = async () => {
    try {
      setLoading(true);
      // Get user email from localStorage (optional - can be null/empty)
      const userEmail = localStorage.getItem('userEmail') || '';
      
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/movie-buddies/all`, {
        headers: {
          'user-email': userEmail
        }
      });
      
      if (response.data.success) {
        const processedGroups = response.data.data.map(group => {
          const buddies = group.buddies || [];
          // Updated logic: Single = 1 seat, Group = more than 1 seat
          const singleBookings = buddies.filter(buddy => {
            const seatCount = Array.isArray(buddy.seatNumbers) ? buddy.seatNumbers.length : 0;
            return seatCount === 1;
          }).length;
          const groupBookings = buddies.filter(buddy => {
            const seatCount = Array.isArray(buddy.seatNumbers) ? buddy.seatNumbers.length : 0;
            return seatCount > 1;
          }).length;
          const totalSeats = buddies.reduce((acc, buddy) => {
            const seatCount = Array.isArray(buddy.seatNumbers) ? buddy.seatNumbers.length : 0;
            return acc + seatCount;
          }, 0);
          
          return {
            ...group,
            buddies,
            groupBookings,
            singleBookings,
            totalSeats,
            totalBuddies: buddies.length
          };
        });
        
        setMovieBuddyGroups(processedGroups);
        setOriginalMovieBuddyGroups(processedGroups); // Store original for filter reset
        
        // Set user's movie details if provided
        if (response.data.userMovieDetails) {
          setUserMovieDetails(response.data.userMovieDetails);
          console.log('User movie details set:', response.data.userMovieDetails);
          console.log('Filtered groups returned from backend:', processedGroups.length);
        } else {
          console.log('No user movie details found - showing all movie buddies');
        }
      } else {
        console.error('API response not successful:', response.data);
        setMovieBuddyGroups([]); // Set empty array instead of showing error
      }
    } catch (error) {
      console.error('Error fetching movie buddy groups:', error);
      // Don't show error toast, just log it and show empty list
      setMovieBuddyGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleViewDetails = (buddy, group) => {
    navigate('/movie-buddy-profile', { 
      state: { 
        movieName: group.movieName,
        movieDate: group.movieDate,
        movieTime: group.movieTime,
        name: buddy.name,
        age: buddy.age,
        gender: buddy.gender,
        email: buddy.email,
        phone: buddy.phone,
        privacySettings: buddy.privacySettings,
        seatNumbers: buddy.seatNumbers,
        isGroup: buddy.isGroup
      } 
    });
  };

  const handleFilterClick = (group) => {
    setSelectedBooking({
      movieName: group.movieName,
      movieDate: group.movieDate,
      movieTime: group.movieTime,
      bookingDate: new Date().toISOString().split('T')[0],
      seatNumbers: group.buddies[0]?.seatNumbers || [],
      preferences: {
        gender: group.buddies[0]?.gender || '',
        age: group.buddies[0]?.age || '',
        moviePreferences: group.buddies[0]?.moviePreferences || []
      },
      privacySettings: group.buddies[0]?.privacySettings || {
        showName: true,
        showEmail: false,
        showPhone: false,
        petName: ''
      }
    });
  };

  // New handlers for advanced filter
  const handleAdvancedFilterOpen = () => {
    setShowAdvancedFilter(true);
  };

  const handleAdvancedFilterClose = () => {
    setShowAdvancedFilter(false);
  };

  const handleFilterResults = (filteredResults) => {
    console.log('Filtered results received:', filteredResults);
    setMovieBuddyGroups(filteredResults);
    toast.success(`Filter applied! Found ${filteredResults.reduce((acc, group) => acc + group.totalBuddies, 0)} matching buddies.`);
  };

  const resetToOriginalResults = () => {
    setMovieBuddyGroups(originalMovieBuddyGroups);
    toast.info('Filters cleared. Showing all your movie buddies.');
  };

  const handleWhatsAppChat = (buddy) => {
    const message = `Hi! I'm interested in connecting with you for the movie. Let's chat about it!`;
    // Format phone number to ensure it has +94 country code
    let phoneNumber = buddy.phone;
    // Remove any existing country code or leading zeros
    phoneNumber = phoneNumber.replace(/^\+94|^0/, '');
    // Add +94 country code
    phoneNumber = `+94${phoneNumber}`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleViewProfile = (buddy) => {
    setSelectedProfile(buddy);
    setShowProfileModal(true);
  };

  const handleMovieFilter = (movieName) => {
    setFilterOptions(prev => ({
      ...prev,
      movieName: prev.movieName === movieName ? '' : movieName
    }));
  };

  const filteredGroups = movieBuddyGroups
    .filter(group => {
      // If user is logged in and has movie details, backend already filtered correctly
      // Only apply search and additional filters
      const matchesSearch = 
        group.movieName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.movieDate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.movieTime?.toLowerCase().includes(searchTerm.toLowerCase());

      // Apply additional filters only if user manually selects them
      // If user has movie details, backend already handles the main filtering
      const matchesFilter = 
        (!filterOptions.movieName || group.movieName === filterOptions.movieName) &&
        (!filterOptions.date || group.movieDate === filterOptions.date) &&
        (!filterOptions.time || group.movieTime === filterOptions.time) &&
        (filterOptions.bookingType === 'all' ||
         (filterOptions.bookingType === 'group' && group.groupBookings > 0) ||
         (filterOptions.bookingType === 'single' && group.singleBookings > 0));

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  if (!isAuthChecked || loading) {
    return (
      <div className="min-h-screen bg-deep-space text-silver flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-space text-silver">
      <CustomerNavBar />
      <div className="container mx-auto px-4 pt-24 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          

          {/* Show user's current movie details - now always show since user is logged in */}
          {userMovieDetails && (
            <div className="bg-amber/10 rounded-xl p-4 mb-6 border border-amber/20">
              <div className="flex items-center space-x-4">
                <FontAwesomeIcon icon={faTicketAlt} className="text-amber text-xl" />
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <span className="text-amber font-semibold">Movie:</span>
                    <span className="text-silver">{userMovieDetails.movieName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-amber text-sm" />
                    <span className="text-silver">{formatDate(userMovieDetails.movieDate)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={faClock} className="text-amber text-sm" />
                    <span className="text-silver">{userMovieDetails.movieTime}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-electric-purple/10 rounded-xl p-8 border border-silver/10 shadow-lg">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <FontAwesomeIcon icon={faPeopleGroup} className="text-amber text-2xl" />
                  <h1 className="text-3xl font-bold text-amber">
                    Your Movie Buddies
                  </h1>
                </div>
                <span className="px-3 py-1 bg-amber/20 text-amber rounded-full text-sm">
                  Logged In
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search your movie buddies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 bg-deep-space border border-silver/20 rounded-lg text-silver focus:outline-none focus:border-amber w-64"
                  />
                  <FontAwesomeIcon icon={faSearch} className="absolute right-3 top-3 text-silver/50" />
                </div>
                {movieBuddyGroups.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleAdvancedFilterOpen}
                      className="px-6 py-2 bg-amber/20 text-amber hover:bg-amber/30 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                    >
                      <FontAwesomeIcon icon={faFilter} />
                      <span>Filter Your Preference</span>
                    </button>
                    <button
                      onClick={resetToOriginalResults}
                      className="px-4 py-2 bg-electric-purple/20 text-electric-purple hover:bg-electric-purple/30 rounded-lg transition-colors duration-200"
                    >
                      Reset Filters
                    </button>
                  </div>
                )}
              </div>
            </div>

            {showFilterModal && (
              <div className="fixed inset-0 bg-black/50 z-50">
                <div className="fixed inset-y-0 right-0 w-full max-w-md bg-deep-space shadow-xl">
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b border-silver/10">
                      <h2 className="text-xl font-bold text-amber">Filter Preferences</h2>
                      <button
                        onClick={() => setShowFilterModal(false)}
                        className="text-silver hover:text-amber"
                      >
                        <FontAwesomeIcon icon={faTimes} className="text-xl" />
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                      {/* Old filter modal content removed */}
                    </div>
                  </div>
                </div>
              </div>
            )}

            

            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredGroups.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="p-6 bg-electric-purple/10 rounded-xl border border-silver/10">
                    <FontAwesomeIcon icon={faUserFriends} className="text-amber text-6xl mb-4" />
                    <h3 className="text-xl font-bold text-amber mb-2">
                      No Movie Buddies Found
                    </h3>
                    <p className="text-silver/70">
                      {userMovieDetails 
                        ? `No other movie buddies found for ${userMovieDetails.movieName} on ${formatDate(userMovieDetails.movieDate)} at ${userMovieDetails.movieTime}. Be the first to connect with others!`
                        : 'No movie buddies found for your booking. Be the first to connect with others!'
                      }
                    </p>
                  </div>
                </div>
              ) : (
                // Flatten all buddies from all groups and create individual cards
                filteredGroups.flatMap(group => 
                  group.buddies.map((buddy, buddyIndex) => (
                    <motion.div
                      key={`${group.movieName}-${group.movieDate}-${group.movieTime}-${buddy.email}-${buddyIndex}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-electric-purple/10 rounded-lg p-4 border border-silver/10 hover:border-amber/30 transition-all duration-300 hover:shadow-lg hover:shadow-amber/10"
                    >
                      {/* Buddy Profile */}
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`p-2 rounded-full ${(buddy.seatNumbers && buddy.seatNumbers.length > 1) ? 'bg-amber/20' : 'bg-electric-purple/20'}`}>
                          <FontAwesomeIcon 
                            icon={(buddy.seatNumbers && buddy.seatNumbers.length > 1) ? faUserGroup : faUser} 
                            className={`text-lg ${(buddy.seatNumbers && buddy.seatNumbers.length > 1) ? 'text-amber' : 'text-electric-purple'}`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-1 mb-1">
                            <h4 className="text-lg font-semibold text-silver truncate">
                              {buddy.privacySettings?.showName ? buddy.name : buddy.privacySettings?.petName || 'Anonymous'}
                            </h4>
                            {!buddy.privacySettings?.showName && (
                              <FontAwesomeIcon icon={faUserSecret} className="text-amber text-xs" title="Using pet name" />
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-xs">
                            <span className="text-silver/70">
                              {buddy.age}y
                            </span>
                            <span className="text-silver/50">•</span>
                            <span className="text-silver/70">
                              {buddy.gender}
                            </span>
                          </div>
                          <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${
                            (buddy.seatNumbers && buddy.seatNumbers.length > 1)
                              ? 'bg-amber/20 text-amber' 
                              : 'bg-electric-purple/20 text-electric-purple'
                          }`}>
                            {(buddy.seatNumbers && buddy.seatNumbers.length > 1) ? 'Group' : 'Single'}
                          </span>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="bg-deep-space/50 rounded-lg p-2 mb-3">
                        <div className="space-y-1">
                          {buddy.privacySettings?.showEmail && (
                            <div className="flex items-center space-x-2">
                              <FontAwesomeIcon icon={faEnvelope} className="text-amber text-xs" />
                              <span className="text-silver text-xs truncate">{buddy.email}</span>
                            </div>
                          )}
                          {buddy.privacySettings?.showPhone && (
                            <div className="flex items-center space-x-2">
                              <FontAwesomeIcon icon={faPhone} className="text-amber text-xs" />
                              <span className="text-silver text-xs">{buddy.phone}</span>
                            </div>
                          )}
                          {(!buddy.privacySettings?.showEmail && !buddy.privacySettings?.showPhone) && (
                            <div className="flex items-center space-x-2">
                              <FontAwesomeIcon icon={faUserSecret} className="text-amber text-xs" />
                              <span className="text-silver/60 text-xs">Contact via WhatsApp</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Seat Information */}
                      <div className="mb-3">
                        <h5 className="text-amber font-semibold mb-1 text-xs">Seats:</h5>
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(buddy.seatNumbers) && buddy.seatNumbers.slice(0, 3).map((seat, seatIndex) => (
                            <span
                              key={seatIndex}
                              className="bg-amber/20 text-amber px-2 py-0.5 rounded-full text-xs flex items-center"
                            >
                              <FontAwesomeIcon icon={faChair} className="mr-1" />
                              {seat}
                            </span>
                          ))}
                          {buddy.seatNumbers?.length > 3 && (
                            <span className="bg-amber/20 text-amber px-2 py-0.5 rounded-full text-xs">
                              +{buddy.seatNumbers.length - 3}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Movie Preferences */}
                      {buddy.moviePreferences && buddy.moviePreferences.length > 0 && (
                        <div className="mb-3">
                          <h5 className="text-amber font-semibold mb-1 text-xs">Preferences:</h5>
                          <div className="flex flex-wrap gap-1">
                            {buddy.moviePreferences.slice(0, 2).map((pref, prefIndex) => (
                              <span
                                key={prefIndex}
                                className="bg-electric-purple/20 text-electric-purple px-2 py-0.5 rounded-full text-xs"
                              >
                                {pref}
                              </span>
                            ))}
                            {buddy.moviePreferences.length > 2 && (
                              <span className="text-silver/60 text-xs px-2 py-0.5">
                                +{buddy.moviePreferences.length - 2}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewProfile(buddy)}
                          className="flex-1 bg-electric-purple/20 text-electric-purple hover:bg-electric-purple/30 py-1.5 px-2 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1"
                        >
                          <FontAwesomeIcon icon={faIdCard} className="text-xs" />
                          <span className="text-xs">Profile</span>
                        </button>
                        <button
                          onClick={() => handleWhatsAppChat(buddy)}
                          className="flex-1 bg-amber/20 text-amber hover:bg-amber/30 py-1.5 px-2 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1"
                        >
                          <FontAwesomeIcon icon={faUserFriends} className="text-xs" />
                          <span className="text-xs">Chat</span>
                        </button>
                      </div>
                    </motion.div>
                  ))
                )
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {showProfileModal && selectedProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-deep-space p-8 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-amber">Profile Details</h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-silver hover:text-amber"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-amber/20 rounded-full">
                  <FontAwesomeIcon icon={faUserCircle} className="text-amber text-4xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-amber">
                    {selectedProfile.privacySettings?.showName ? selectedProfile.name : selectedProfile.privacySettings?.petName || 'Anonymous'}
                  </h3>
                  <p className="text-silver/75">
                    {(selectedProfile.seatNumbers && selectedProfile.seatNumbers.length > 1) ? 'Group Booking' : 'Single Booking'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-electric-purple/10 p-4 rounded-lg">
                  <h4 className="text-amber font-semibold mb-2">Personal Information</h4>
                  <div className="space-y-2">
                    <p className="text-silver">
                      <span className="text-silver/60">Age:</span> {selectedProfile.age}
                    </p>
                    <p className="text-silver">
                      <span className="text-silver/60">Gender:</span> {selectedProfile.gender}
                    </p>
                    {selectedProfile.privacySettings?.showEmail && (
                      <p className="text-silver">
                        <span className="text-silver/60">Email:</span> {selectedProfile.email}
                      </p>
                    )}
                    {selectedProfile.privacySettings?.showPhone && (
                      <p className="text-silver">
                        <span className="text-silver/60">Phone:</span> {selectedProfile.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-electric-purple/10 p-4 rounded-lg">
                  <h4 className="text-amber font-semibold mb-2">Booking Details</h4>
                  <div className="space-y-2">
                    <p className="text-silver">
                      <span className="text-silver/60">Seat Numbers:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedProfile.seatNumbers?.map((seat, index) => (
                          <span
                            key={index}
                            className="bg-amber/20 text-amber px-2 py-0.5 rounded-full text-xs flex items-center"
                          >
                            <FontAwesomeIcon icon={faChair} className="mr-1" />
                            {seat}
                          </span>
                        ))}
                      </div>
                    </p>
                    {selectedProfile.moviePreferences && (
                      <p className="text-silver">
                        <span className="text-silver/60">Movie Preferences:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedProfile.moviePreferences.map((pref, index) => (
                            <span
                              key={index}
                              className="bg-electric-purple/20 text-electric-purple px-2 py-0.5 rounded-full text-xs"
                            >
                              {pref}
                            </span>
                          ))}
                        </div>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => handleWhatsAppChat(selectedProfile)}
                  className="px-6 py-2 bg-amber/20 text-amber hover:bg-amber/30 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                >
                  <FontAwesomeIcon icon={faUserFriends} />
                  <span>Chat on WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Filter Modal */}
      <MovieBuddyFilter
        isOpen={showAdvancedFilter}
        onClose={handleAdvancedFilterClose}
        onFilterResults={handleFilterResults}
        userMovieDetails={userMovieDetails}
      />
    </div>
  );
};

export default MovieBuddyList;