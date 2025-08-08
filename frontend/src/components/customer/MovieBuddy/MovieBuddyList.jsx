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
  faHome
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import CustomerNavBar from '../../navbar/MovieBuddyNavBar';

const MovieBuddyList = () => {
  const navigate = useNavigate();
  const [movieBuddyGroups, setMovieBuddyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('movieDate');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterOptions, setFilterOptions] = useState({
    bookingType: 'all',
    privacy: 'all',
    movieName: ''
  });
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showFilterPortal, setShowFilterPortal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Get unique movie names for navigation
  const uniqueMovieNames = [...new Set(movieBuddyGroups.map(group => group.movieName))];

  useEffect(() => {
    fetchMovieBuddyGroups();
  }, []);

  const fetchMovieBuddyGroups = async () => {
    try {
      setLoading(true);
      // Get user email from localStorage
      const userEmail = localStorage.getItem('userEmail');
      
      const response = await axios.get('http://localhost:3000/api/movie-buddies/all', {
        headers: {
          'user-email': userEmail || ''
        }
      });
      
      if (response.data.success) {
        const processedGroups = response.data.data.map(group => {
          const buddies = group.buddies || [];
          const groupBookings = buddies.filter(buddy => buddy.isGroup).length;
          const singleBookings = buddies.filter(buddy => !buddy.isGroup).length;
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
      } else {
        toast.error('Failed to load movie buddy groups');
      }
    } catch (error) {
      console.error('Error fetching movie buddy groups:', error);
      toast.error(error.response?.data?.message || 'Failed to load movie buddy groups');
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
    setShowFilterPortal(true);
  };

  const handleFilterClose = () => {
    setShowFilterPortal(false);
    setSelectedBooking(null);
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
      const matchesSearch = 
        group.movieName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.movieDate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.movieTime?.toLowerCase().includes(searchTerm.toLowerCase());

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

  if (loading) {
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
          {/* Movie Name Navigation Bar */}
          <div className="bg-electric-purple/10 rounded-xl p-4 mb-6 border border-silver/10 overflow-x-auto">
            <div className="flex items-center space-x-4 min-w-max">
              <button
                onClick={() => setFilterOptions(prev => ({ ...prev, movieName: '' }))}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2 ${
                  !filterOptions.movieName
                    ? 'bg-amber text-deep-space'
                    : 'bg-deep-space text-silver hover:bg-amber/20 hover:text-amber'
                }`}
              >
                <FontAwesomeIcon icon={faHome} />
                <span>All Movies</span>
              </button>
              <div className="flex items-center space-x-3">
                <FontAwesomeIcon icon={faTicketAlt} className="text-amber text-xl" />
                <span className="text-amber font-semibold">Movies:</span>
              </div>
              {uniqueMovieNames.map((movieName) => (
                <button
                  key={movieName}
                  onClick={() => handleMovieFilter(movieName)}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 whitespace-nowrap ${
                    filterOptions.movieName === movieName
                      ? 'bg-amber text-deep-space'
                      : 'bg-deep-space text-silver hover:bg-amber/20 hover:text-amber'
                  }`}
                >
                  {movieName}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-electric-purple/10 rounded-xl p-8 border border-silver/10 shadow-lg">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <FontAwesomeIcon icon={faUsers} className="text-amber text-2xl" />
                  <h1 className="text-3xl font-bold text-amber">Movie Buddies</h1>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search movie buddies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 bg-deep-space border border-silver/20 rounded-lg text-silver focus:outline-none focus:border-amber w-64"
                  />
                  <FontAwesomeIcon icon={faSearch} className="absolute right-3 top-3 text-silver/50" />
                </div>
                <button
                  onClick={() => handleFilterClick(movieBuddyGroups[0])}
                  className="px-6 py-2 bg-amber/20 text-amber hover:bg-amber/30 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                >
                  <FontAwesomeIcon icon={faFilter} />
                  <span>Filter Your Preference</span>
                </button>
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
                      <MovieBuddyPortal />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group) => (
                <motion.div
                  key={`${group.movieName}-${group.movieDate}-${group.movieTime}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-electric-purple/10 rounded-xl p-6 border border-silver/10 hover:border-amber/30 transition-all duration-300 hover:shadow-lg hover:shadow-amber/10"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-amber/20 rounded-full">
                        <FontAwesomeIcon icon={faTicketAlt} className="text-amber text-xl" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-amber">{group.movieName}</h3>
                        <p className="text-silver/75 text-sm">{formatDate(group.movieDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-amber/20 text-amber rounded-full text-sm">
                        {group.movieTime}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {group.buddies.slice(0, 3).map((buddy, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-electric-purple/20 transition-colors duration-200"
                      >
                        <div className={`p-2 rounded-full ${buddy.isGroup ? 'bg-amber/20' : 'bg-electric-purple/20'}`}>
                          <FontAwesomeIcon 
                            icon={buddy.isGroup ? faUserGroup : faUser} 
                            className={`${buddy.isGroup ? 'text-amber' : 'text-electric-purple'}`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-silver font-medium truncate">
                              {buddy.privacySettings?.showName ? buddy.name : buddy.privacySettings?.petName || 'Anonymous'}
                            </h4>
                            {!buddy.privacySettings?.showName && (
                              <FontAwesomeIcon icon={faUserSecret} className="text-amber text-sm" title="Using pet name" />
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-silver/60">
                              {buddy.age} • {buddy.gender}
                            </span>
                            <span className="text-xs text-silver/40">•</span>
                            <span className="text-xs text-silver/60">
                              {buddy.isGroup ? 'Group' : 'Single'}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(buddy.seatNumbers) && buddy.seatNumbers.slice(0, 2).map((seat, seatIndex) => (
                            <span
                              key={seatIndex}
                              className="bg-amber/20 text-amber px-2 py-0.5 rounded-full text-xs flex items-center"
                            >
                              <FontAwesomeIcon icon={faChair} className="mr-1" />
                              {seat}
                            </span>
                          ))}
                          {buddy.seatNumbers?.length > 2 && (
                            <span className="bg-amber/20 text-amber px-2 py-0.5 rounded-full text-xs">
                              +{buddy.seatNumbers.length - 2}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleViewProfile(buddy)}
                          className="p-2 text-amber hover:text-amber/80 transition-colors duration-200"
                          title="View Profile"
                        >
                          <FontAwesomeIcon icon={faIdCard} />
                        </button>
                      </div>
                    ))}
                    {group.buddies.length > 3 && (
                      <div className="text-center">
                        <button
                          onClick={() => setSelectedGroup(group)}
                          className="text-amber hover:text-amber/80 text-sm font-medium"
                        >
                          View all {group.buddies.length} buddies
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2">
                    {/* <button
                      onClick={() => handleViewDetails(group.buddies[0], group)}
                      className="w-full bg-electric-purple/20 text-electric-purple hover:bg-electric-purple/30 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <FontAwesomeIcon icon={faChartBar} />
                      <span>View Details</span>
                    </button> */}
                    {/* <button
                      onClick={() => handleWhatsAppChat(group.buddies[0])}
                      className="w-full bg-amber/20 text-amber hover:bg-amber/30 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <FontAwesomeIcon icon={faUserFriends} />
                      <span>Chat on WhatsApp</span>
                    </button> */}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {showFilterPortal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-deep-space p-8 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-amber">Filter Your Preference</h2>
              <button
                onClick={handleFilterClose}
                className="text-silver hover:text-amber"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <MovieBuddyPortal bookingData={selectedBooking} />
          </div>
        </div>
      )}

      {selectedGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-deep-space p-8 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-amber">Group Details</h2>
              <button
                onClick={() => setSelectedGroup(null)}
                className="text-silver hover:text-amber"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          </div>
        </div>
      )}

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
                    {selectedProfile.isGroup ? 'Group Booking' : 'Single Booking'}
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
    </div>
  );
};

export default MovieBuddyList;