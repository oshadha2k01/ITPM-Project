import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faPlus,
  faSearch,
  faSpinner,
  faExclamationTriangle,
  faTimes,
  faUser,
  faCalendar,
  faUsers,
  faLink,
  faClock,
  faTheaterMasks,
  faFilePdf,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import AdminNavbar from "../../navbar/AdminNavbar";
import { jsPDF } from "jspdf";

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortField, setSortField] = useState("movie_name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    movieId: null,
    movieName: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/movies`);
      const data = await response.json();

      if (data.success) {
        setMovies(data.data || []);
      } else {
        toast.error(data.message || "Failed to fetch movies");
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
      toast.error("Failed to fetch movies");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (movie) => {
    setDeleteModal({
      show: true,
      movieId: movie._id,
      movieName: movie.movie_name,
    });
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/movies/${deleteModal.movieId}`,
        {
          method: "DELETE",
        }
      );
      const data = await response.json();

      if (data.success) {
        toast.success("Movie deleted successfully");
        fetchMovies();
      } else {
        toast.error(data.message || "Failed to delete movie");
      }
    } catch (error) {
      console.error("Error deleting movie:", error);
      toast.error("Failed to delete movie");
    } finally {
      setDeleteModal({ show: false, movieId: null, movieName: "" });
    }
  };

  const handleEdit = (movieId) => {
    navigate(`/admin/movies/edit/${movieId}`);
  };

  const handleGeneratePDF = () => {
    const nowShowing = movies.filter((movie) => movie.status === "Now Showing");
    const upcoming = movies.filter((movie) => movie.status === "Upcoming");

    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      // Define colors for GalaxyX Cinema branding
      const galaxyPurple = [102, 51, 153];
      const galaxyAmber = [255, 191, 0];
      const galaxySilver = [0, 0, 0];

      // Helper function to sanitize strings
      const sanitizeString = (str) => {
        return typeof str === "string" ? str.replace(/[^\w\s.,-]/g, "") : "N/A";
      };

      // Helper function to format date
      const formatDate = (dateStr) => {
        try {
          const date = new Date(dateStr);
          return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString("en-GB");
        } catch {
          return "N/A";
        }
      };

      // Cover Page
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.setTextColor(...galaxyPurple);
      doc.text("GalaxyX Cinema Movie List", 20, 20, { align: "left" });

      doc.setFontSize(16);
      doc.setTextColor(...galaxySilver);
      doc.text("Now Showing and Upcoming Movies", 20, 30);

      doc.setFontSize(12);
      doc.setTextColor(...galaxyAmber);
      const today = new Date().toLocaleDateString("en-GB");
      doc.text(`Generated on ${today}`, 20, 40);

      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(...galaxySilver);
      doc.text("Prepared by GalaxyX Cinema Administration", 20, 50);

      // Add new page for content
      doc.addPage();

      // Now Showing Movies
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(...galaxyPurple);
      doc.text("Now Showing Movies", 20, 20);

      let y = 30;
      if (nowShowing.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...galaxySilver);
        doc.text("#", 20, y);
        doc.text("Movie Name", 30, y);
        doc.text("Genre", 100, y);
        doc.text("Release Date", 150, y);

        y += 5;
        doc.setLineWidth(0.2);
        doc.setDrawColor(...galaxySilver);
        doc.line(20, y, 190, y);
        y += 5;

        doc.setFont("helvetica", "normal");
        nowShowing.forEach((movie, index) => {
          try {
            const movieName = sanitizeString(movie.movie_name);
            const genre = sanitizeString(movie.genre);
            const releaseDate = formatDate(movie.release_date);

            doc.text(`${index + 1}`, 20, y);
            doc.text(movieName, 30, y, { maxWidth: 60 });
            doc.text(genre, 100, y, { maxWidth: 40 });
            doc.text(releaseDate, 150, y);
            y += 10;

            // Add new page if content exceeds page height
            if (y > 260) {
              doc.addPage();
              y = 20;
            }
          } catch (error) {
            console.error(`Error processing movie ${movie.movie_name}:`, error);
            doc.text(`${index + 1}. Error`, 20, y);
            y += 10;
          }
        });
      } else {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.setTextColor(...galaxySilver);
        doc.text("No movies currently showing.", 20, y);
        y += 10;
      }

      // Upcoming Movies
      y += 10;
      if (y > 240) {
        doc.addPage();
        y = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(...galaxyPurple);
      doc.text("Upcoming Movies", 20, y);

      y += 10;
      if (upcoming.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...galaxySilver);
        doc.text("#", 20, y);
        doc.text("Movie Name", 30, y);
        doc.text("Genre", 100, y);
        doc.text("Release Date", 150, y);

        y += 5;
        doc.setLineWidth(0.2);
        doc.setDrawColor(...galaxySilver);
        doc.line(20, y, 190, y);
        y += 5;

        doc.setFont("helvetica", "normal");
        upcoming.forEach((movie, index) => {
          try {
            const movieName = sanitizeString(movie.movie_name);
            const genre = sanitizeString(movie.genre);
            const releaseDate = formatDate(movie.release_date);

            doc.text(`${index + 1}`, 20, y);
            doc.text(movieName, 30, y, { maxWidth: 60 });
            doc.text(genre, 100, y, { maxWidth: 40 });
            doc.text(releaseDate, 150, y);
            y += 10;

            // Add new page if content exceeds page height
            if (y > 260) {
              doc.addPage();
              y = 20;
            }
          } catch (error) {
            console.error(`Error processing movie ${movie.movie_name}:`, error);
            doc.text(`${index + 1}. Error`, 20, y);
            y += 10;
          }
        });
      } else {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.setTextColor(...galaxySilver);
        doc.text("No upcoming movies.", 20, y);
        y += 10;
      }

      // Approval Section
      if (y > 220) {
        doc.addPage();
        y = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(...galaxyPurple);
      doc.text("Approval", 20, y);

      y += 10;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...galaxySilver);
      doc.text(
        "This movie list has been verified and approved by the GalaxyX Cinema Administration.",
        20,
        y,
        { maxWidth: 170 }
      );

      y += 20;
      doc.setFont("helvetica", "bold");
      doc.text("Signature: ______________________", 20, y);
      y += 10;
      doc.text(`Date: ${today}`, 20, y);

      // Save the PDF
      doc.save("GalaxyX_Cinema_Movie_List.pdf");
      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("Detailed PDF generation error:", error);
      toast.error(`Failed to generate PDF: ${error.message}`);
    }
  };

  const filteredMovies = movies.filter((movie) => {
    const matchesSearch =
      movie.movie_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.director.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.genre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || movie.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedMovies = [...filteredMovies].sort((a, b) => {
    const aValue = a[sortField]?.toString().toLowerCase() || "";
    const bValue = b[sortField]?.toString().toLowerCase() || "";
    return sortOrder === "asc"
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  const handleSort = (field) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Upcoming":
        return "bg-indigo-200 text-indigo-800";
      case "Now Showing":
        return "bg-yellow-200 text-yellow-800";
      case "End":
        return "bg-red-200 text-red-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  const getImageUrl = (imagePath) => {
    const cleanPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
    return `${import.meta.env.VITE_API_BASE_URL}/uploads/${cleanPath}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-space text-silver">
        <AdminNavbar />
        <div className="container mx-auto p-4 flex justify-center items-center h-[calc(100vh-80px)]">
          <FontAwesomeIcon
            icon={faSpinner}
            spin
            size="3x"
            className="text-amber"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-space text-silver">
      <AdminNavbar />
      <div className="container mx-auto p-4">
        <Toaster position="top-right" />
        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteModal.show && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-deep-space border border-silver/10 rounded-xl p-6 max-w-md w-full mx-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-scarlet">
                    <FontAwesomeIcon
                      icon={faExclamationTriangle}
                      className="text-2xl mr-3"
                    />
                    <h3 className="text-xl font-semibold">Delete Movie</h3>
                  </div>
                  <button
                    onClick={() =>
                      setDeleteModal({
                        show: false,
                        movieId: null,
                        movieName: "",
                      })
                    }
                    className="text-silver/70 hover:text-silver"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
                <p className="text-silver/90 mb-6">
                  Are you sure you want to delete "{deleteModal.movieName}"?
                  This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() =>
                      setDeleteModal({
                        show: false,
                        movieId: null,
                        movieName: "",
                      })
                    }
                    className="px-4 py-2 rounded-lg bg-deep-space/50 text-silver hover:bg-deep-space/70 transition-colors duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 rounded-lg bg-scarlet hover:bg-red-700 text-white transition-colors duration-300"
                  >
                    Delete Movie
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-amber mb-4 md:mb-0">
            Movie Management
          </h1>
          <div className="flex space-x-4">
            <button
              onClick={handleGeneratePDF}
              className="bg-electric-purple hover:bg-amber text-white px-4 py-2 rounded-lg transition-colors duration-300 flex items-center"
            >
              <FontAwesomeIcon icon={faFilePdf} className="mr-2" />
              Download Movie List PDF
            </button>
            <Link
              to="/admin/movies/add"
              className="bg-scarlet hover:bg-amber text-white px-4 py-2 rounded-lg transition-colors duration-300 flex items-center"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Add New Movie
            </Link>
          </div>
        </div>

        {/* Filters Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-3 text-silver/50"
            />
            <input
              type="text"
              placeholder="Search by name, director, or genre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-deep-space/50 border border-silver/30 rounded-lg pl-10 pr-4 py-2 text-silver focus:border-electric-purple focus:ring-1 focus:ring-electric-purple outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-deep-space/50 border border-silver/30 rounded-lg px-4 py-2 text-silver focus:border-electric-purple focus:ring-1 focus:ring-electric-purple outline-none"
          >
            <option value="All">All Status</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Now Showing">Now Showing</option>
            <option value="End">End</option>
          </select>

          <select
            value={sortField}
            onChange={(e) => handleSort(e.target.value)}
            className="bg-deep-space/50 border border-silver/30 rounded-lg px-4 py-2 text-silver focus:border-electric-purple focus:ring-1 focus:ring-electric-purple outline-none"
          >
            <option value="movie_name">Sort by Name</option>
            <option value="release_date">Sort by Release Date</option>
            <option value="director">Sort by Director</option>
            <option value="genre">Sort by Genre</option>
          </select>
        </div>

        {/* Movie Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedMovies.map((movie) => (
            <motion.div
              key={movie._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-electric-purple/10 backdrop-blur-lg rounded-lg overflow-hidden border border-silver/10 hover:border-electric-purple/50 transition-all duration-300"
            >
              {/* Movie Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={getImageUrl(movie.image_name)}
                  alt={movie.movie_name}
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                      movie.status
                    )}`}
                  >
                    {movie.status}
                  </span>
                </div>
              </div>

              {/* Movie Details */}
              <div className="p-3">
                <h3 className="text-amber font-semibold text-lg mb-1 truncate">
                  {movie.movie_name}
                </h3>

                {/* Director */}
                <div className="flex items-center text-silver/80 text-sm mb-1">
                  <FontAwesomeIcon icon={faUser} className="mr-2" />
                  <span className="truncate">{movie.director}</span>
                </div>

                {/* Release Date */}
                <div className="flex items-center text-silver/80 text-sm mb-1">
                  <FontAwesomeIcon icon={faCalendar} className="mr-2" />
                  <span>
                    {new Date(movie.release_date).toLocaleDateString()}
                  </span>
                </div>

                {/* Cast */}
                <div className="flex items-start text-silver/80 text-sm mb-1">
                  <FontAwesomeIcon icon={faUsers} className="mr-2 mt-1" />
                  <span className="line-clamp-2">{movie.cast.join(", ")}</span>
                </div>

                {/* Genre */}
                <div className="flex items-center text-silver/80 text-sm mb-1">
                  <FontAwesomeIcon icon={faTheaterMasks} className="mr-2" />
                  <span>{movie.genre}</span>
                </div>

                {/* Show Times */}
                <div className="flex items-start text-silver/80 text-sm mb-2">
                  <FontAwesomeIcon icon={faClock} className="mr-2 mt-1" />
                  <span className="line-clamp-2">
                    {movie.show_times.join(", ")}
                  </span>
                </div>

                {/* Description */}
                <div className="text-silver/60 text-xs mb-2 line-clamp-2">
                  {movie.description}
                </div>

                {/* Trailer Link */}
                {movie.trailer_link && (
                  <div className="flex items-center text-silver/80 text-sm mb-3">
                    <FontAwesomeIcon icon={faLink} className="mr-2" />
                    <a
                      href={movie.trailer_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber hover:text-electric-purple truncate"
                    >
                      Watch Trailer
                    </a>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEdit(movie._id)}
                    className="bg-electric-purple/20 hover:bg-electric-purple/30 text-electric-purple px-3 py-1 rounded-lg text-sm transition-colors duration-300"
                  >
                    <FontAwesomeIcon icon={faEdit} className="mr-1" />
                    Edit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteClick(movie)}
                    className="bg-scarlet/20 hover:bg-scarlet/30 text-scarlet px-3 py-1 rounded-lg text-sm transition-colors duration-300"
                  >
                    <FontAwesomeIcon icon={faTrash} className="mr-1" />
                    Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieList;