import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFilter,
  faUsers,
  faUser,
  faVenusMars,
  faBirthdayCake,
  faFilm,
  faTimes,
  faSearch,
  faSpinner,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const MovieBuddyFilter = ({ isOpen, onClose, onFilterResults, userMovieDetails }) => {
  const [loading, setLoading] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    ageRanges: [], // Changed to array for multiple selections
    genders: [], // Changed to array for multiple selections
    bookingTypes: [], // Changed to array for multiple selections
    moviePreferences: []
  });

  // Movie genres - same as in MovieBuddyForm
  const movieGenres = [
    'Action', 'Comedy', 'Drama', 'Horror',
    'Sci-Fi', 'Animation', 'Thriller', 'Romance',
    'Documentary', 'Family', 'Fantasy', 'Mystery'
  ];

  const ageRanges = [
    { value: '18-25', label: '18-25 years' },
    { value: '26-35', label: '26-35 years' },
    { value: '36-45', label: '36-45 years' },
    { value: '46-60', label: '46-60 years' },
    { value: '60+', label: '60+ years' }
  ];

  const handleInputChange = (field, value) => {
    setFilterOptions(prev => {
      if (field === 'ageRanges' || field === 'genders' || field === 'bookingTypes') {
        // Handle array-based selections for checkboxes
        const currentArray = prev[field] || [];
        if (currentArray.includes(value)) {
          // Remove if already selected
          return {
            ...prev,
            [field]: currentArray.filter(item => item !== value)
          };
        } else {
          // Add if not selected
          return {
            ...prev,
            [field]: [...currentArray, value]
          };
        }
      } else {
        // Handle single value selections
        return {
          ...prev,
          [field]: value
        };
      }
    });
  };

  const handleMoviePreferenceToggle = (genre) => {
    setFilterOptions(prev => ({
      ...prev,
      moviePreferences: prev.moviePreferences.includes(genre)
        ? prev.moviePreferences.filter(g => g !== genre)
        : [...prev.moviePreferences, genre]
    }));
  };

  const handleFilterSubmit = async () => {
    if (!userMovieDetails) {
      toast.error('No movie details available for filtering');
      return;
    }

    try {
      setLoading(true);
      
      // Get logged-in user email
      const userEmail = localStorage.getItem('userEmail');
      
      console.log('Filter options:', filterOptions);
      console.log('User movie details:', userMovieDetails);
      
      // First, get all movie buddies for the same movie
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/movie-buddies/buddies`, {
        params: {
          movieName: userMovieDetails.movieName,
          movieDate: userMovieDetails.movieDate,
          movieTime: userMovieDetails.movieTime,
          email: userEmail // Exclude current user
        }
      });

      if (response.data && Array.isArray(response.data)) {
        let filteredBuddies = response.data;
        
        // Apply age filters (multiple selections)
        if (filterOptions.ageRanges && filterOptions.ageRanges.length > 0) {
          filteredBuddies = filteredBuddies.filter(buddy => {
            return filterOptions.ageRanges.some(ageRange => {
              if (ageRange === '60+') {
                return buddy.age >= 60;
              } else {
                const [minAge, maxAge] = ageRange.split('-').map(Number);
                return buddy.age >= minAge && buddy.age <= maxAge;
              }
            });
          });
        }

        // Apply gender filters (multiple selections)
        if (filterOptions.genders && filterOptions.genders.length > 0) {
          filteredBuddies = filteredBuddies.filter(buddy => 
            filterOptions.genders.includes(buddy.gender)
          );
        }

        // Apply booking type filters (multiple selections) - Updated to seat-based logic
        if (filterOptions.bookingTypes && filterOptions.bookingTypes.length > 0) {
          filteredBuddies = filteredBuddies.filter(buddy => {
            const seatCount = Array.isArray(buddy.seatNumbers) ? buddy.seatNumbers.length : 0;
            
            return filterOptions.bookingTypes.some(bookingType => {
              if (bookingType === 'single') {
                return seatCount === 1; // Single booking = exactly 1 seat
              } else if (bookingType === 'group') {
                return seatCount > 1; // Group booking = more than 1 seat
              }
              return true; // For 'all' or any other type
            });
          });
        }

        // Apply movie preferences filter
        if (filterOptions.moviePreferences.length > 0) {
          filteredBuddies = filteredBuddies.filter(buddy => {
            if (!buddy.moviePreferences || buddy.moviePreferences.length === 0) {
              return false; // Exclude buddies with no preferences
            }
            // Check if there's at least one matching preference
            return filterOptions.moviePreferences.some(pref => 
              buddy.moviePreferences.includes(pref)
            );
          });
        }

        console.log(`Filtered results: ${filteredBuddies.length} buddies found`);
        
        // Group the filtered buddies by movie details for consistency with existing structure
        const groupedResult = [{
          movieName: userMovieDetails.movieName,
          movieDate: userMovieDetails.movieDate,
          movieTime: userMovieDetails.movieTime,
          buddies: filteredBuddies,
          totalBuddies: filteredBuddies.length
        }];

        // Pass filtered results back to parent component
        onFilterResults(groupedResult);
        
        toast.success(`Found ${filteredBuddies.length} matching movie buddies!`);
        onClose();
      } else {
        console.error('Invalid response format:', response.data);
        toast.error('Failed to fetch movie buddies');
      }
    } catch (error) {
      console.error('Error filtering movie buddies:', error);
      toast.error('Failed to filter movie buddies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilterOptions({
      ageRanges: [],
      genders: [],
      bookingTypes: [],
      moviePreferences: []
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-deep-space rounded-xl p-6 max-w-6xl w-full max-h-[95vh] border border-silver/10 flex flex-col"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber/20 rounded-full">
              <FontAwesomeIcon icon={faFilter} className="text-amber text-xl" />
            </div>
            <h2 className="text-2xl font-bold text-amber">Filter Movie Buddies</h2>
          </div>
          <button
            onClick={onClose}
            className="text-silver hover:text-amber transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} className="text-xl" />
          </button>
        </div>

        {/* Movie Details Info */}
        {userMovieDetails && (
          <div className="bg-amber/10 rounded-lg p-3 mb-4 border border-amber/20">
            <p className="text-amber font-medium mb-1">Filtering buddies for:</p>
            <p className="text-silver text-sm">
              <span className="font-semibold">{userMovieDetails.movieName}</span> • 
              <span className="ml-2">{userMovieDetails.movieDate}</span> • 
              <span className="ml-2">{userMovieDetails.movieTime}</span>
            </p>
          </div>
        )}

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Age Range */}
            <div className="space-y-4">
              <div>
                <label className="block text-amber font-semibold mb-3">
                  <FontAwesomeIcon icon={faBirthdayCake} className="mr-2" />
                  Age Range
                </label>
                <div className="space-y-2">
                  {ageRanges.map((range) => (
                    <div key={range.value} className="flex items-center space-x-3">
                      <div className="relative">
                        <input
                          type="checkbox"
                          id={`age-${range.value}`}
                          checked={filterOptions.ageRanges.includes(range.value)}
                          onChange={() => handleInputChange('ageRanges', range.value)}
                          className="sr-only"
                        />
                        <label
                          htmlFor={`age-${range.value}`}
                          className={`flex items-center justify-center w-5 h-5 border-2 rounded cursor-pointer transition-all duration-200 ${
                            filterOptions.ageRanges.includes(range.value)
                              ? 'bg-amber border-amber text-deep-space'
                              : 'border-silver/40 hover:border-amber/50'
                          }`}
                        >
                          {filterOptions.ageRanges.includes(range.value) && (
                            <FontAwesomeIcon icon={faCheck} className="text-xs" />
                          )}
                        </label>
                      </div>
                      <label htmlFor={`age-${range.value}`} className="text-silver cursor-pointer hover:text-amber transition-colors">
                        {range.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gender Filter */}
              <div>
                <label className="block text-amber font-semibold mb-3">
                  <FontAwesomeIcon icon={faVenusMars} className="mr-2" />
                  Gender
                </label>
                <div className="space-y-2">
                  {['Male', 'Female', 'Other'].map((gender) => (
                    <div key={gender} className="flex items-center space-x-3">
                      <div className="relative">
                        <input
                          type="checkbox"
                          id={`gender-${gender}`}
                          checked={filterOptions.genders.includes(gender)}
                          onChange={() => handleInputChange('genders', gender)}
                          className="sr-only"
                        />
                        <label
                          htmlFor={`gender-${gender}`}
                          className={`flex items-center justify-center w-5 h-5 border-2 rounded cursor-pointer transition-all duration-200 ${
                            filterOptions.genders.includes(gender)
                              ? 'bg-amber border-amber text-deep-space'
                              : 'border-silver/40 hover:border-amber/50'
                          }`}
                        >
                          {filterOptions.genders.includes(gender) && (
                            <FontAwesomeIcon icon={faCheck} className="text-xs" />
                          )}
                        </label>
                      </div>
                      <label htmlFor={`gender-${gender}`} className="text-silver cursor-pointer hover:text-amber transition-colors">
                        {gender}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Middle Column - Booking Type */}
            <div>
              <label className="block text-amber font-semibold mb-3">
                <FontAwesomeIcon icon={faUsers} className="mr-2" />
                Booking Type
              </label>
              <div className="space-y-2">
                {[
                  { value: 'single', label: 'Single Bookings (1 seat)', icon: faUser },
                  { value: 'group', label: 'Group Bookings (2+ seats)', icon: faUsers }
                ].map((type) => (
                  <div key={type.value} className="flex items-center space-x-3">
                    <div className="relative">
                      <input
                        type="checkbox"
                        id={`booking-${type.value}`}
                        checked={filterOptions.bookingTypes.includes(type.value)}
                        onChange={() => handleInputChange('bookingTypes', type.value)}
                        className="sr-only"
                      />
                      <label
                        htmlFor={`booking-${type.value}`}
                        className={`flex items-center justify-center w-5 h-5 border-2 rounded cursor-pointer transition-all duration-200 ${
                          filterOptions.bookingTypes.includes(type.value)
                            ? 'bg-amber border-amber text-deep-space'
                            : 'border-silver/40 hover:border-amber/50'
                        }`}                        >
                          {filterOptions.bookingTypes.includes(type.value) && (
                            <FontAwesomeIcon icon={faCheck} className="text-xs" />
                          )}
                        </label>
                    </div>
                    <label htmlFor={`booking-${type.value}`} className="text-silver cursor-pointer hover:text-amber transition-colors">
                      {type.label}
                    </label>
                  </div>
                ))}
              </div>
              
              {/* Selection Summary */}
              {(filterOptions.ageRanges.length > 0 || filterOptions.genders.length > 0 || filterOptions.bookingTypes.length > 0) && (
                <div className="mt-4 p-3 bg-amber/10 rounded-lg border border-amber/20">
                  <p className="text-amber text-sm font-medium mb-2">Active Filters:</p>
                  <div className="space-y-1 text-xs">
                    {filterOptions.ageRanges.length > 0 && (
                      <p className="text-silver">
                        <span className="text-amber">Age:</span> {filterOptions.ageRanges.length} range{filterOptions.ageRanges.length > 1 ? 's' : ''}
                      </p>
                    )}
                    {filterOptions.genders.length > 0 && (
                      <p className="text-silver">
                        <span className="text-amber">Gender:</span> {filterOptions.genders.length} option{filterOptions.genders.length > 1 ? 's' : ''}
                      </p>
                    )}
                    {filterOptions.bookingTypes.length > 0 && (
                      <p className="text-silver">
                        <span className="text-amber">Type:</span> {filterOptions.bookingTypes.length} option{filterOptions.bookingTypes.length > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Movie Preferences */}
            <div>
              <label className="block text-amber font-semibold mb-3">
                <FontAwesomeIcon icon={faFilm} className="mr-2" />
                Movie Preferences
              </label>
              <p className="text-silver/70 text-sm mb-3">
                Select genres to find buddies with similar interests (optional)
              </p>
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {movieGenres.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => handleMoviePreferenceToggle(genre)}
                    className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center space-x-2 ${
                      filterOptions.moviePreferences.includes(genre)
                        ? 'bg-amber text-deep-space font-medium border-2 border-amber'
                        : 'bg-electric-purple/20 text-silver hover:bg-electric-purple/30 border-2 border-transparent hover:border-electric-purple/40'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      filterOptions.moviePreferences.includes(genre)
                        ? 'bg-deep-space border-deep-space'
                        : 'border-silver/40'
                    }`}>
                      {filterOptions.moviePreferences.includes(genre) && (
                        <FontAwesomeIcon icon={faCheck} className="text-amber text-xs" />
                      )}
                    </div>
                    <span>{genre}</span>
                  </button>
                ))}
              </div>
              {filterOptions.moviePreferences.length > 0 && (
                <div className="mt-3 p-2 bg-amber/10 rounded-lg border border-amber/20">
                  <p className="text-amber/70 text-sm">
                    <FontAwesomeIcon icon={faFilm} className="mr-1" />
                    {filterOptions.moviePreferences.length} genre{filterOptions.moviePreferences.length > 1 ? 's' : ''} selected
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-silver/10 bg-deep-space">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-silver hover:text-amber transition-colors"
          >
            Clear All Filters
          </button>
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-deep-space/50 text-silver hover:bg-deep-space/70 rounded-lg transition-colors border border-silver/20"
            >
              Cancel
            </button>
            <button
              onClick={handleFilterSubmit}
              disabled={loading}
              className="px-6 py-2 bg-amber text-deep-space rounded-lg hover:bg-amber/90 transition-colors flex items-center space-x-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  <span>Filtering...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSearch} />
                  <span>Filter Movie Buddies</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MovieBuddyFilter; 