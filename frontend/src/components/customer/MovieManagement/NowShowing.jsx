// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import MainNavBar from '../../navbar/MainNavBar';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { 
//   faSearch, 
//   faFilter, 
//   faClock, 
//   faTicketAlt,
//   faPlay,
//   faTimes
// } from '@fortawesome/free-solid-svg-icons';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const NowShowing = () => {
//   const [movies, setMovies] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedGenre, setSelectedGenre] = useState('all');
//   const [selectedMovie, setSelectedMovie] = useState(null);
//   const [showTrailer, setShowTrailer] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchMovies();
//   }, []);

//   const fetchMovies = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/movies`);
//       if (!response.ok) {
//         throw new Error('Failed to fetch movies');
//       }
//       const data = await response.json();
      
//       if (data.success && Array.isArray(data.data)) {
//         const nowShowingMovies = data.data.filter(movie => movie.status === 'Now Showing');
//         setMovies(nowShowingMovies);
//         setError(null);
//       } else {
//         throw new Error('Invalid data format received from server');
//       }
//     } catch (error) {
//       console.error('Error fetching movies:', error);
//       toast.error('Failed to load movies. Please try again later.', {
//         position: "top-right",
//         autoClose: 5000,
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//       });
//       setError('Failed to load movies. Please try again later.');
//       setMovies([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBookTickets = (movie) => {
//     navigate(`/book-tickets/${movie._id}`, { state: { movieData: movie } });
//   };

//   const formatTrailerUrl = (url) => {
//     if (!url) return '';
    
//     // If it's already an embed URL, return it
//     if (url.includes('youtube.com/embed/')) {
//       return url;
//     }

//     // Extract video ID from different YouTube URL formats
//     let videoId = '';
//     if (url.includes('youtube.com/watch?v=')) {
//       videoId = url.split('v=')[1].split('&')[0];
//     } else if (url.includes('youtu.be/')) {
//       videoId = url.split('youtu.be/')[1].split('?')[0];
//     }

//     // Return embed URL if we found a video ID
//     if (videoId) {
//       return `https://www.youtube.com/embed/${videoId}`;
//     }

//     // If it's not a YouTube URL, return the original URL
//     return url;
//   };

//   const handlePlayTrailer = (movie) => {
//     if (!movie.trailer_link) {
//       toast.error('No trailer available for this movie');
//       return;
//     }

//     const formattedUrl = formatTrailerUrl(movie.trailer_link);
//     setSelectedMovie({
//       ...movie,
//       trailer_link: formattedUrl
//     });
//     setShowTrailer(true);
//   };

//   const handleCloseTrailer = () => {
//     setShowTrailer(false);
//     setSelectedMovie(null);
//   };

//   const genres = ['all', ...new Set(movies.map(movie => movie.genre))];

//   const filteredMovies = movies
//     .filter(movie => {
//       const matchesSearch = movie.movie_name.toLowerCase().includes(searchTerm.toLowerCase());
//       const matchesGenre = selectedGenre === 'all' || movie.genre === selectedGenre;
//       return matchesSearch && matchesGenre;
//     });

//   return (
//     <div className="min-h-screen bg-deep-space pt-16">
//       <MainNavBar />
//       <ToastContainer
//         position="top-right"
//         autoClose={5000}
//         hideProgressBar={false}
//         newestOnTop={false}
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//         theme="dark"
//       />
      
//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="text-center mb-12">
//           <h1 className="text-4xl font-bold text-amber mb-4">Now Showing</h1>
//           <p className="text-silver text-lg">Discover the latest blockbusters and must-watch films</p>
//         </div>

//         <div className="bg-electric-purple/10 rounded-lg p-6 mb-8">
//           <div className="flex flex-col md:flex-row gap-4">
//             <div className="flex-1">
//               <div className="relative">
//                 <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-silver" />
//                 <input
//                   type="text"
//                   placeholder="Search movies..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full pl-10 pr-4 py-2 bg-deep-space border border-silver/20 rounded-lg text-silver focus:outline-none focus:border-amber"
//                 />
//               </div>
//             </div>
//             <div className="flex gap-4">
//               <div className="relative">
//                 <FontAwesomeIcon icon={faFilter} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-silver" />
//                 <select
//                   value={selectedGenre}
//                   onChange={(e) => setSelectedGenre(e.target.value)}
//                   className="pl-10 pr-4 py-2 bg-deep-space border border-silver/20 rounded-lg text-silver focus:outline-none focus:border-amber"
//                 >
//                   {genres.map(genre => (
//                     <option key={genre} value={genre} className="capitalize">{genre}</option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//           </div>
//         </div>
//         {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"> */}
//         {loading ? (
//           <div className="flex justify-center items-center h-64">
//             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber"></div>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//             {filteredMovies.map((movie) => (
//               <div
//                 key={movie._id}
//                 className="bg-electric-purple/10 rounded-lg overflow-hidden transform transition-transform duration-300 hover:scale-105"
//               >
//                 <div className="relative">
//                   <img
//                     src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${movie.image_name}`}
//                     alt={movie.movie_name}
//                     className="w-full h-[280px] object-cover"
//                   />
                  
//                 </div>
//                 <div className="p-4">
//                   <h3 className="text-lg font-bold text-amber mb-1">{movie.movie_name}</h3>
//                   <p className="text-silver text-sm mb-1">{movie.genre}</p>
//                   <p className="text-silver text-sm mb-2 line-clamp-2">{movie.description}</p>
//                   <div className="flex items-center text-silver text-sm mb-3">
//                     <FontAwesomeIcon icon={faClock} className="mr-2" />
//                     <span>Show Times: {movie.show_times.join(', ')}</span>
//                   </div>
//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => handleBookTickets(movie)}
//                       className="flex-1 flex items-center space-x-2 bg-amber hover:bg-scarlet px-3 py-1.5 rounded-lg transition-colors duration-300 text-sm text-black justify-center"
//                     >
//                       <FontAwesomeIcon icon={faTicketAlt} className='text-black'/>
//                       <span>Book Tickets</span>
//                     </button>
//                     {movie.trailer_link && (
//                       <button
//                         onClick={() => handlePlayTrailer(movie)}
//                         className="flex items-center space-x-2 bg-electric-purple hover:bg-electric-purple/80 px-3 py-1.5 rounded-lg transition-colors duration-300 text-sm text-white justify-center"
//                       >
//                         <FontAwesomeIcon icon={faPlay} />
//                         <span>Trailer</span>
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* Trailer Modal */}
//         {showTrailer && selectedMovie && (
//           <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
//             <div className="relative w-full max-w-4xl">
//               <button
//                 onClick={handleCloseTrailer}
//                 className="absolute -top-12 right-0 text-white hover:text-amber transition-colors duration-300"
//               >
//                 <FontAwesomeIcon icon={faTimes} className="text-2xl" />
//               </button>
//               <div className="relative pt-[56.25%]">
//                 <iframe
//                   src={selectedMovie.trailer_link}
//                   className="absolute top-0 left-0 w-full h-full"
//                   title={`${selectedMovie.movie_name} Trailer`}
//                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                   allowFullScreen
//                 ></iframe>
//               </div>
//             </div>
//           </div>
//         )}

//         {!loading && filteredMovies.length === 0 && (
//           <div className="text-center py-12">
//             <p className="text-silver text-lg">No movies found matching your criteria.</p>
//           </div>
//         )}
//       </main>

//       <footer className="bg-deep-space border-t border-silver/10 mt-12">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//           <div className="text-center text-silver">
//             <p>© {new Date().getFullYear()} GalaxyX Cinema. All rights reserved.</p>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default NowShowing;


import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainNavBar from '../../navbar/MainNavBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faClock, faTicketAlt, faPlay, faTimes } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NowShowing = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      // Optional: Use query parameter if backend supports it
      const API_BASE = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${API_BASE}/api/movies?status=Now Showing`);
      // const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/movies`); // Original fetch
      if (!response.ok) {
        throw new Error('Failed to fetch movies');
      }
      const data = await response.json();
      console.log('API Response:', data); // Debug: Check the full response

      if (data.success && Array.isArray(data.data)) {
        // If using query parameter, no need to filter here
        const nowShowingMovies = data.data; 
        // Original filtering: 
        // const nowShowingMovies = data.data.filter(movie => movie.status === 'Now Showing');
        console.log('Now Showing Movies:', nowShowingMovies); // Debug: Check filtered movies
        setMovies(nowShowingMovies);
        setError(null);
      } else {
        throw new Error('Invalid data format received from server');
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
      toast.error('Failed to load movies. Please try again later.');
      setError('Failed to load movies. Please try again later.');
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookTickets = (movie) => {
    navigate(`/book-tickets/${movie._id}`, { state: { movieData: movie } });
  };

  const formatTrailerUrl = (url) => {
    if (!url) return '';
    if (url.includes('youtube.com/embed/')) return url;
    let videoId = '';
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  const handlePlayTrailer = (movie) => {
    if (!movie.trailer_link) {
      toast.error('No trailer available for this movie');
      return;
    }
    const formattedUrl = formatTrailerUrl(movie.trailer_link);
    setSelectedMovie({ ...movie, trailer_link: formattedUrl });
    setShowTrailer(true);
  };

  const handleCloseTrailer = () => {
    setShowTrailer(false);
    setSelectedMovie(null);
  };

  const genres = ['all', ...new Set(movies.map(movie => movie.genre))];

  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.movie_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === 'all' || movie.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="min-h-screen bg-deep-space pt-16">
      <MainNavBar />
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} closeOnClick pauseOnHover theme="dark" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-amber mb-4">Now Showing</h1>
          <p className="text-silver text-lg">Discover the latest blockbusters and must-watch films</p>
        </div>

        <div className="bg-electric-purple/10 rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-silver" />
                <input
                  type="text"
                  placeholder="Search movies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-deep-space border border-silver/20 rounded-lg text-silver focus:outline-none focus:border-amber"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="relative">
                <FontAwesomeIcon icon={faFilter} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-silver" />
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-deep-space border border-silver/20 rounded-lg text-silver focus:outline-none focus:border-amber"
                >
                  {genres.map(genre => (
                    <option key={genre} value={genre} className="capitalize">{genre}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber"></div>
          </div>
        ) : error ? (
          <div className="text-center text-silver">{error}</div>
        ) : filteredMovies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-silver text-lg">No movies currently showing.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMovies.map((movie) => (
              <div key={movie._id} className="bg-electric-purple/10 rounded-lg overflow-hidden transform transition-transform duration-300 hover:scale-105">
                <div className="relative">
                  <img
                    src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${movie.image_name}`}
                    alt={movie.movie_name}
                    className="w-full h-[280px] object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-amber mb-1">{movie.movie_name}</h3>
                  <p className="text-silver text-sm mb-1">{movie.genre}</p>
                  <p className="text-silver text-sm mb-2 line-clamp-2">{movie.description}</p>
                  <div className="flex items-center text-silver text-sm mb-3">
                    <FontAwesomeIcon icon={faClock} className="mr-2" />
                    <span>Show Times: {movie.show_times.join(', ')}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBookTickets(movie)}
                      className="flex-1 flex items-center space-x-2 bg-amber hover:bg-scarlet px-3 py-1.5 rounded-lg transition-colors duration-300 text-sm text-black justify-center"
                    >
                      <FontAwesomeIcon icon={faTicketAlt} className="text-black" />
                      <span>Book Tickets</span>
                    </button>
                    {movie.trailer_link && (
                      <button
                        onClick={() => handlePlayTrailer(movie)}
                        className="flex items-center space-x-2 bg-electric-purple hover:bg-electric-purple/80 px-3 py-1.5 rounded-lg transition-colors duration-300 text-sm text-white justify-center"
                      >
                        <FontAwesomeIcon icon={faPlay} />
                        <span>Trailer</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showTrailer && selectedMovie && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl">
              <button
                onClick={handleCloseTrailer}
                className="absolute -top-12 right-0 text-white hover:text-amber transition-colors duration-300"
              >
                <FontAwesomeIcon icon={faTimes} className="text-2xl" />
              </button>
              <div className="relative pt-[56.25%]">
                <iframe
                  src={selectedMovie.trailer_link}
                  className="absolute top-0 left-0 w-full h-full"
                  title={`${selectedMovie.movie_name} Trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-deep-space border-t border-silver/10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-silver">
            <p>© {new Date().getFullYear()} GalaxyX Cinema. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NowShowing;