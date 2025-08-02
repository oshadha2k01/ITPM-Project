import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faSort, 
  faTrash,
  faChair,
  faUsers,
  faUserGroup,
  faUser,
  faSpinner,
  faCalendarAlt,
  faClock,
  faTicketAlt,
  faChartBar,
  faTimes,
  faArrowLeft,
  faEnvelope,
  faPhone,
  faUserSecret,
  faEye,
  faEyeSlash,
  faFileDownload
} from '@fortawesome/free-solid-svg-icons';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import AdminNavBar from '../../navbar/AdminNavbar';

const MovieBuddy = () => {
  const [movieBuddyGroups, setMovieBuddyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('lastUpdated');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [stats, setStats] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'stats'

  useEffect(() => {
    fetchMovieBuddyGroups();
    fetchStats();
  }, []);

  const fetchMovieBuddyGroups = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/movie-buddies/all`);
      
      if (response.data.success) {
        // Process the data to calculate group/single bookings and total seats
        const processedGroups = response.data.data.map(group => {
          // Ensure buddies array exists
          const buddies = group.buddies || [];
          
          // Calculate statistics
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

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/movie-buddies/all`);
      if (response.data.success) {
        const groups = response.data.data;
        
        // Calculate statistics
        const stats = {
          totalGroups: groups.length,
          totalBuddies: groups.reduce((acc, group) => acc + (group.buddies?.length || 0), 0),
          totalSeats: groups.reduce((acc, group) => {
            return acc + (group.buddies?.reduce((seatAcc, buddy) => {
              return seatAcc + (Array.isArray(buddy.seatNumbers) ? buddy.seatNumbers.length : 0);
            }, 0) || 0);
          }, 0),
          totalGroupBookings: groups.reduce((acc, group) => {
            return acc + (group.buddies?.filter(buddy => buddy.isGroup).length || 0);
          }, 0),
          totalSingleBookings: groups.reduce((acc, group) => {
            return acc + (group.buddies?.filter(buddy => !buddy.isGroup).length || 0);
          }, 0),
          averageGroupSize: groups.reduce((acc, group) => {
            return acc + (group.buddies?.length || 0);
          }, 0) / (groups.length || 1)
        };
        
        setStats(stats);
      } else {
        toast.error('Failed to load statistics');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error(error.response?.data?.message || 'Failed to load statistics');
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

  const handleDelete = (group) => {
    setGroupToDelete(group);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/movie-buddies/${groupToDelete.movieName}/${groupToDelete.movieDate}/${groupToDelete.movieTime}`);
      
      if (response.data.success) {
        toast.success('Movie buddy group deleted successfully');
        fetchMovieBuddyGroups(); // Refresh the list
        setDeleteModalOpen(false);
        setGroupToDelete(null);
      } else {
        toast.error(response.data.message || 'Failed to delete movie buddy group');
      }
    } catch (error) {
      console.error('Error deleting movie buddy group:', error);
      toast.error(error.response?.data?.message || 'Failed to delete movie buddy group');
    }
  };

  const generateReport = async () => {
    if (filteredGroups.length === 0) {
      toast.error('No movie buddy groups available to generate a report');
      return;
    }

    const doc = new jsPDF();
    
    // Cover Page
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(33, 33, 33);
    doc.text('Movie Buddy Group Report', 105, 50, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 70, { align: 'center' });
    doc.text(`Total Groups: ${filteredGroups.length}`, 105, 80, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('Prepared by: GalaxyX Cinema Admin', 105, 100, { align: 'center' });
    doc.text('Contact: support@galaxyxcinema.com', 105, 110, { align: 'center' });
    
    // Add new page for content
    doc.addPage();

    // Detailed Group Sections
    let yPos = 20;
    filteredGroups.forEach((group, index) => {
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      // Section Header
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(242, 101, 34); // Amber-like color
      doc.text(`Group ${index + 1}: ${group.movieName}`, 14, yPos);
      yPos += 10;

      // Group Details
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(33, 33, 33);
      const groupDetails = [
        { label: 'Date:', value: formatDate(group.movieDate) || 'N/A' },
        { label: 'Time:', value: group.movieTime || 'N/A' },
        { label: 'Total Buddies:', value: group.totalBuddies.toString() || '0' },
        { label: 'Total Seats:', value: group.totalSeats.toString() || '0' },
        { label: 'Group Bookings:', value: group.groupBookings.toString() || '0' },
        { label: 'Single Bookings:', value: group.singleBookings.toString() || '0' },
      ];

      groupDetails.forEach((item) => {
        doc.setFont('helvetica', 'bold');
        doc.text(item.label, 14, yPos);
        doc.setFont('helvetica', 'normal');
        const valueLines = doc.splitTextToSize(item.value, 130); // Wrap long text
        doc.text(valueLines, 50, yPos);
        yPos += 8 * valueLines.length;
      });

      // Buddies Subheader
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(242, 101, 34);
      doc.text('Buddies:', 14, yPos);
      yPos += 8;

      // Buddies Details
      group.buddies.forEach((buddy, buddyIndex) => {
        if (yPos > 260) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(33, 33, 33);
        const buddyDetails = [
          { label: `Buddy ${buddyIndex + 1} Name:`, value: buddy.privacySettings?.showName ? buddy.name : buddy.privacySettings?.petName || 'Anonymous' },
          { label: 'Email:', value: buddy.privacySettings?.showEmail ? buddy.email : 'Hidden' },
          { label: 'Phone:', value: buddy.privacySettings?.showPhone ? buddy.phone : 'Hidden' },
          { label: 'Seats:', value: Array.isArray(buddy.seatNumbers) ? buddy.seatNumbers.join(', ') : 'N/A' },
          { label: 'Booking Type:', value: buddy.isGroup ? 'Group' : 'Single' },
          { label: 'Age:', value: buddy.age?.toString() || 'N/A' },
          { label: 'Gender:', value: buddy.gender || 'N/A' },
          { label: 'Booking ID:', value: buddy.bookingId || 'N/A' },
          { label: 'Booked on:', value: new Date(buddy.bookingDate).toLocaleDateString() || 'N/A' },
        ];

        buddyDetails.forEach((item) => {
          doc.setFont('helvetica', 'bold');
          doc.text(item.label, 20, yPos);
          doc.setFont('helvetica', 'normal');
          const valueLines = doc.splitTextToSize(item.value, 120); // Wrap long text
          doc.text(valueLines, 60, yPos);
          yPos += 8 * valueLines.length;
        });
        yPos += 4;
      });

      // Horizontal line
      doc.setLineWidth(0.5);
      doc.setDrawColor(150, 150, 150);
      doc.line(14, yPos, 196, yPos);
      yPos += 10;
    });

    // Summary Table
    doc.addPage();
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(242, 101, 34);
    doc.text('Summary Table', 14, 20);
    yPos = 30;

    const tableData = filteredGroups.map(group => [
      group.movieName || 'N/A',
      formatDate(group.movieDate) || 'N/A',
      group.movieTime || 'N/A',
      group.totalBuddies.toString() || '0',
      group.totalSeats.toString() || '0',
      group.groupBookings.toString() || '0',
      group.singleBookings.toString() || '0',
    ]);

    if (typeof doc.autoTable === 'function') {
      doc.autoTable({
        startY: yPos,
        head: [['Movie Name', 'Date', 'Time', 'Total Buddies', 'Total Seats', 'Group Bookings', 'Single Bookings']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [66, 66, 66], textColor: [255, 255, 255] },
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 30 },
          2: { cellWidth: 20 },
          3: { cellWidth: 20 },
          4: { cellWidth: 20 },
          5: { cellWidth: 20 },
          6: { cellWidth: 20 },
        },
      });
    } else {
      console.error('autoTable is not available. Skipping summary table.');
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(33, 33, 33);
      doc.text('Summary table could not be generated due to missing autoTable plugin.', 14, yPos);
      yPos += 10;
    }

    // Footer
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text('Thank you for choosing GalaxyX Cinema.', 105, doc.internal.pageSize.height - 20, { align: 'center' });
    doc.text('For inquiries: support@galaxyxcinema.com | www.galaxyxcinema.com', 105, doc.internal.pageSize.height - 10, { align: 'center' });

    // Add page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
    }

    // Save the PDF
    doc.save('movie_buddy_group_report.pdf');
  };

  const filteredGroups = movieBuddyGroups
    .filter(group => {
      const searchLower = searchTerm.toLowerCase();
      return (
        group.movieName?.toLowerCase().includes(searchLower) ||
        group.movieDate?.toLowerCase().includes(searchLower) ||
        group.movieTime?.toLowerCase().includes(searchLower)
      );
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-space text-silver flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-space text-silver">
      <AdminNavBar />
      <div className="container mx-auto px-4 py-8">
        <Toaster position="top-right" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          <div className="bg-electric-purple/10 rounded-xl p-8 border border-silver/10 shadow-lg">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <FontAwesomeIcon icon={faUsers} className="text-amber text-2xl" />
                  <h1 className="text-3xl font-bold text-amber">Movie Buddy Management</h1>
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
                  onClick={() => setViewMode(viewMode === 'list' ? 'stats' : 'list')}
                  className="px-4 py-2 bg-electric-purple/20 text-silver rounded-lg hover:bg-electric-purple/30 flex items-center space-x-2"
                >
                  <FontAwesomeIcon icon={faChartBar} />
                  <span>{viewMode === 'list' ? 'View Stats' : 'View List'}</span>
                </button>
                <button
                  onClick={generateReport}
                  className="px-4 py-2 bg-amber text-deep-space rounded-lg hover:bg-amber/80 flex items-center"
                >
                  <FontAwesomeIcon icon={faFileDownload} className="mr-2" />
                  Generate Report
                </button>
              </div>
            </div>

            {viewMode === 'stats' ? (
              // Stats View
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-electric-purple/20 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-amber mb-4">Overall Statistics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-silver/75">Total Groups</span>
                      <span className="text-2xl font-bold text-amber">{stats?.totalGroups || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-silver/75">Total Buddies</span>
                      <span className="text-2xl font-bold text-amber">{stats?.totalBuddies || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-silver/75">Total Seats</span>
                      <span className="text-2xl font-bold text-amber">{stats?.totalSeats || 0}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-electric-purple/20 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-amber mb-4">Booking Types</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-silver/75">Group Bookings</span>
                      <span className="text-2xl font-bold text-amber">{stats?.totalGroupBookings || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-silver/75">Single Bookings</span>
                      <span className="text-2xl font-bold text-amber">{stats?.totalSingleBookings || 0}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-electric-purple/20 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-amber mb-4">Average Group Size</h3>
                  <div className="flex justify-center items-center h-full">
                    <span className="text-4xl font-bold text-amber">
                      {stats?.averageGroupSize ? stats.averageGroupSize.toFixed(1) : 0}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              // List View
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-silver/20">
                  <thead>
                    <tr>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-silver uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('movieName')}
                      >
                        Movie Name
                        <FontAwesomeIcon icon={faSort} className="ml-2" />
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-silver uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('movieDate')}
                      >
                        Date
                        <FontAwesomeIcon icon={faSort} className="ml-2" />
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-silver uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('movieTime')}
                      >
                        Time
                        <FontAwesomeIcon icon={faSort} className="ml-2" />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-silver uppercase tracking-wider">
                        Total Buddies
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-silver uppercase tracking-wider">
                        Total Seats
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-silver uppercase tracking-wider">
                        Group/Single
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-silver uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-silver/20">
                    {filteredGroups.map((group) => (
                      <tr key={`${group.movieName}-${group.movieDate}-${group.movieTime}`} className="hover:bg-silver/5">
                        <td className="px-6 py-4 whitespace-nowrap text-silver">
                          {group.movieName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-silver">
                          {formatDate(group.movieDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-silver">
                          {group.movieTime}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-silver">
                          {group.totalBuddies}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-silver">
                          <div className="flex items-center">
                            <FontAwesomeIcon icon={faChair} className="mr-2 text-amber" />
                            {group.totalSeats} seats
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-silver">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              group.groupBookings > 0 ? 'bg-amber/20 text-amber' : 'bg-electric-purple/20 text-electric-purple'
                            }`}>
                              {group.groupBookings} Groups
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              group.singleBookings > 0 ? 'bg-electric-purple/20 text-electric-purple' : 'bg-amber/20 text-amber'
                            }`}>
                              {group.singleBookings} Singles
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => setSelectedGroup(group)}
                            className="text-amber hover:text-amber/80 mr-3"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleDelete(group)}
                            className="text-scarlet hover:text-scarlet/80"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Group Details Modal */}
            {selectedGroup && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-deep-space p-8 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-amber">Movie Buddy Details</h2>
                    <button
                      onClick={() => setSelectedGroup(null)}
                      className="text-silver hover:text-amber"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                  
                  <div className="bg-electric-purple/20 rounded-lg p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-3">
                        <FontAwesomeIcon icon={faTicketAlt} className="text-amber text-xl" />
                        <div>
                          <p className="text-silver/75">Movie</p>
                          <p className="text-xl font-semibold text-amber">{selectedGroup.movieName}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-amber text-xl" />
                        <div>
                          <p className="text-silver/75">Date</p>
                          <p className="text-xl font-semibold text-amber">{formatDate(selectedGroup.movieDate)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <FontAwesomeIcon icon={faClock} className="text-amber text-xl" />
                        <div>
                          <p className="text-silver/75">Time</p>
                          <p className="text-xl font-semibold text-amber">{selectedGroup.movieTime}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {selectedGroup.buddies.map((buddy, index) => (
                      <div
                        key={index}
                        className="bg-electric-purple/10 rounded-lg p-4 border border-silver/10"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`p-3 rounded-full ${buddy.isGroup ? 'bg-amber/20' : 'bg-electric-purple/20'}`}>
                              <FontAwesomeIcon 
                                icon={buddy.isGroup ? faUserGroup : faUser} 
                                className={`${buddy.isGroup ? 'text-amber' : 'text-electric-purple'} text-xl`}
                              />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="text-lg font-semibold text-silver">
                                  {buddy.privacySettings?.showName ? buddy.name : buddy.privacySettings?.petName || 'Anonymous'}
                                </h3>
                                {!buddy.privacySettings?.showName && (
                                  <FontAwesomeIcon icon={faUserSecret} className="text-amber" title="Using pet name" />
                                )}
                              </div>
                              
                              <div className="flex items-center space-x-2 mt-1">
                                <FontAwesomeIcon icon={faEnvelope} className="text-silver/60" />
                                <span className="text-silver/75">
                                  {buddy.privacySettings?.showEmail ? buddy.email : 'Email hidden'}
                                </span>
                                {!buddy.privacySettings?.showEmail && (
                                  <FontAwesomeIcon icon={faEyeSlash} className="text-amber" title="Email hidden" />
                                )}
                              </div>
                              
                              <div className="flex items-center space-x-2 mt-1">
                                <FontAwesomeIcon icon={faPhone} className="text-silver/60" />
                                <span className="text-silver/75">
                                  {buddy.privacySettings?.showPhone ? buddy.phone : 'Phone hidden'}
                                </span>
                                {!buddy.privacySettings?.showPhone && (
                                  <FontAwesomeIcon icon={faEyeSlash} className="text-amber" title="Phone hidden" />
                                )}
                              </div>

                              <div className="mt-2 text-sm text-silver/60">
                                <p>Age: {buddy.age} • Gender: {buddy.gender}</p>
                                <p>Booking ID: {buddy.bookingId}</p>
                                <p>Booked on: {new Date(buddy.bookingDate).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className={`text-sm font-medium mb-2 ${
                              buddy.isGroup ? 'text-amber' : 'text-electric-purple'
                            }`}>
                              {buddy.isGroup ? 'Group Booking' : 'Single Booking'}
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {Array.isArray(buddy.seatNumbers) && buddy.seatNumbers.map((seat, seatIndex) => (
                                <span
                                  key={seatIndex}
                                  className="bg-amber/20 text-amber px-3 py-1 rounded-full text-sm flex items-center"
                                >
                                  <FontAwesomeIcon icon={faChair} className="mr-2" />
                                  {seat}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Delete Modal */}
            {deleteModalOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-deep-space p-8 rounded-xl max-w-md w-full">
                  <h2 className="text-2xl font-bold text-amber mb-6">Confirm Delete</h2>
                  <p className="text-silver mb-6">
                    Are you sure you want to delete this movie buddy group? This action cannot be undone.
                  </p>
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => setDeleteModalOpen(false)}
                      className="px-4 py-2 text-silver hover:text-amber"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmDelete}
                      className="px-4 py-2 bg-scarlet text-white rounded-lg hover:bg-scarlet/80"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MovieBuddy;