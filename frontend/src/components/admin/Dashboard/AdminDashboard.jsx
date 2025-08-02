import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminNavbar from '../../navbar/AdminNavbar';
import MovieList from '../../admin/MovieManagement/MovieList';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilm, faTicketAlt, faCalendarCheck, faClock } from '@fortawesome/free-solid-svg-icons';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalMovies: 0,
    nowShowing: 0,
    upcoming: 0,
    end: 0,
    bookingsPerMovie: {},
  });
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication on component mount
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      navigate('/login');
      return;
    }
    
    try {
      const user = JSON.parse(userInfo);
      if (user && user.role === 'admin') {
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('userInfo');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error parsing user info:', error);
      localStorage.removeItem('userInfo');
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    // Only fetch stats if authenticated
    if (!isAuthenticated) return;
    
    const fetchStats = async () => {
      try {
        // Fetch bookings
        const bookingsResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/bookings`);
        const bookings = bookingsResponse.data;

        // Fetch movies
        const moviesResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/movies`);
        const moviesData = await moviesResponse.json();
        const movies = moviesData.success ? moviesData.data : [];

        // Calculate bookings per movie
        const bookingsPerMovie = bookings.reduce((acc, booking) => {
          const movieName = booking.movieName || 'Unknown';
          acc[movieName] = (acc[movieName] || 0) + 1;
          return acc;
        }, {});

        // Calculate stats
        setStats({
          totalBookings: bookings.length,
          totalMovies: movies.length,
          nowShowing: movies.filter(movie => movie.status === 'Now Showing').length,
          upcoming: movies.filter(movie => movie.status === 'Upcoming').length,
          end: movies.filter(movie => movie.status === 'End').length,
          bookingsPerMovie,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAuthenticated]);

  // Pie chart data for movie status distribution
  const movieStatusData = {
    labels: ['Now Showing', 'Upcoming', 'End'],
    datasets: [
      {
        data: [stats.nowShowing, stats.upcoming, stats.end],
        backgroundColor: ['#F2A83A', '#4B5EAA', '#E53E3E'], // Amber, Indigo, Scarlet
        hoverBackgroundColor: ['#D69430', '#3B4A8A', '#C53030'],
        borderColor: '#1A1C33', // Deep-space background
        borderWidth: 2,
      },
    ],
  };

  // Pie chart data for bookings per movie
  const bookingsPerMovieData = {
    labels: Object.keys(stats.bookingsPerMovie),
    datasets: [
      {
        data: Object.values(stats.bookingsPerMovie),
        backgroundColor: [
          '#F2A83A',
          '#4B5EAA',
          '#E53E3E',
          '#2D3748',
          '#9F7AEA',
          '#38A169',
          '#ED8936',
        ], // Diverse colors for multiple movies
        hoverBackgroundColor: [
          '#D69430',
          '#3B4A8A',
          '#C53030',
          '#1A202C',
          '#7F63D3',
          '#2F855A',
          '#C56F2A',
        ],
        borderColor: '#1A1C33',
        borderWidth: 2,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#D8DEE9', // Silver text
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        backgroundColor: '#1A1C33',
        titleColor: '#F2A83A',
        bodyColor: '#D8DEE9',
        borderColor: '#F2A83A',
        borderWidth: 1,
      },
    },
  };

  // Render different components based on the current route
  const renderContent = () => {
    if (location.pathname === '/admin/movies') {
      return <MovieList />;
    }
    return (
      <div className="p-4 md:p-8">
        <div className="bg-electric-purple/10 rounded-xl p-8 mb-8">
          <h1 className="text-3xl font-bold text-amber mb-4">
            Welcome to GalaxyX Admin Dashboard
          </h1>
          <p className="text-lg text-silver/80">
            Manage your cinema operations with ease
          </p>
        </div>

        {/* Stats Section */}
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber"></div>
          </div>
        ) : (
          <>
            {/* Numeric Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Bookings Card */}
              <div className="bg-deep-space/50 border border-silver/10 rounded-xl p-6 flex items-center space-x-4 hover:bg-deep-space/70 transition-colors">
                <div className="p-3 bg-amber/10 rounded-full">
                  <FontAwesomeIcon icon={faTicketAlt} className="text-amber text-2xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-silver">Total Bookings</h3>
                  <p className="text-2xl font-bold text-amber">{stats.totalBookings}</p>
                </div>
              </div>

              {/* Total Movies Card */}
              <div className="bg-deep-space/50 border border-silver/10 rounded-xl p-6 flex items-center space-x-4 hover:bg-deep-space/70 transition-colors">
                <div className="p-3 bg-amber/10 rounded-full">
                  <FontAwesomeIcon icon={faFilm} className="text-amber text-2xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-silver">Total Movies</h3>
                  <p className="text-2xl font-bold text-amber">{stats.totalMovies}</p>
                </div>
              </div>

              {/* Now Showing Card */}
              <div className="bg-deep-space/50 border border-silver/10 rounded-xl p-6 flex items-center space-x-4 hover:bg-deep-space/70 transition-colors">
                <div className="p-3 bg-amber/10 rounded-full">
                  <FontAwesomeIcon icon={faCalendarCheck} className="text-amber text-2xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-silver">Now Showing</h3>
                  <p className="text-2xl font-bold text-amber">{stats.nowShowing}</p>
                </div>
              </div>

              {/* Upcoming Movies Card */}
              <div className="bg-deep-space/50 border border-silver/10 rounded-xl p-6 flex items-center space-x-4 hover:bg-deep-space/70 transition-colors">
                <div className="p-3 bg-amber/10 rounded-full">
                  <FontAwesomeIcon icon={faClock} className="text-amber text-2xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-silver">Upcoming Movies</h3>
                  <p className="text-2xl font-bold text-amber">{stats.upcoming}</p>
                </div>
              </div>
            </div>

            {/* Pie Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Movie Status Distribution Pie Chart */}
              <div className="bg-deep-space/50 border border-silver/10 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-amber mb-4">Movie Status Distribution</h3>
                <div className="relative h-80">
                  <Pie data={movieStatusData} options={chartOptions} />
                </div>
              </div>

              {/* Bookings Per Movie Pie Chart */}
              <div className="bg-deep-space/50 border border-silver/10 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-amber mb-4">Bookings Per Movie</h3>
                <div className="relative h-80">
                  {Object.keys(stats.bookingsPerMovie).length > 0 ? (
                    <Pie data={bookingsPerMovieData} options={chartOptions} />
                  ) : (
                    <p className="text-silver/80 text-center mt-20">No booking data available</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  // Show loading while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-deep-space text-silver flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber mx-auto mb-4"></div>
          <p className="text-silver">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-space text-silver">
      <AdminNavbar />
      <main className="container mx-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;