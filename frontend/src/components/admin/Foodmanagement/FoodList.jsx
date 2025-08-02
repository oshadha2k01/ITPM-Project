import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faSort, 
  faEdit, 
  faTrash, 
  faUtensils,
  faTimes,
  faSave,
  faDollarSign,
  faTag,
  faFilter,
  faPlus,
  faList,
  faBurger,
  faFileExport
} from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import AdminNavbar from '../../navbar/AdminNavbar';
import { useNavigate, Link } from 'react-router-dom';

const FoodList = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [foodToDelete, setFoodToDelete] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    ingrediants: '',
    category: '',
    price: '',
    imageUrl: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/foods`);
      setFoods(response.data.data);
    } catch (error) {
      console.error('Error fetching foods:', error);
      toast.error('Failed to load food items');
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

  const handleEdit = (food) => {
    setSelectedFood(food);
    setEditFormData({
      name: food.name,
      ingrediants: food.ingrediants,
      category: food.category,
      price: food.price,
      imageUrl: food.imageUrl
    });
    setEditModalOpen(true);
  };

  const handleDelete = (id) => {
    setFoodToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/foods/${foodToDelete}`);
      toast.success('Food item deleted successfully');
      fetchFoods();
      setDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting food item:', error);
      toast.error('Failed to delete food item');
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/foods/${selectedFood._id}`, editFormData);
      toast.success('Food item updated successfully');
      fetchFoods();
      setEditModalOpen(false);
    } catch (error) {
      console.error('Error updating food item:', error);
      toast.error('Failed to update food item');
    }
  };

  const generateReport = () => {
    try {
      // Create new PDF document
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text('Food Items Report', 14, 15);
      
      // Add date
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25);
      
      // Create table
      const tableColumn = ['Name', 'Category', 'Price', 'Ingredients'];
      const tableRows = filteredFoods.map(food => [
        food.name,
        food.category,
        `$${food.price.toFixed(2)}`,
        food.ingrediants
      ]);
      
      // Add table to PDF
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontSize: 10,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
      });
      
      // Save the PDF
      doc.save(`food-report-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast.success('PDF report generated successfully');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    }
  };

  const filteredFoods = foods
    .filter(food => {
      const searchLower = searchTerm.toLowerCase();
      return (
        food.name?.toLowerCase().includes(searchLower) ||
        food.category?.toLowerCase().includes(searchLower) ||
        food.ingrediants?.toLowerCase().includes(searchLower)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-space text-silver flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-space text-silver">
      <AdminNavbar />
      <div className="container mx-auto px-4 py-8">
        <Toaster position="top-right" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          <div className="bg-electric-purple/10 rounded-xl p-8 border border-silver/10 shadow-lg">
            <div className="bg-electric-purple/10 rounded-lg p-6 mb-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faBurger} className="text-amber text-2xl" />
                  <h1 className="text-2xl font-bold text-amber">Food Management</h1>
                </div>
                
                <div className="flex gap-4">
                  <button
                    onClick={generateReport}
                    className="bg-electric-purple hover:bg-electric-purple/80 text-silver px-4 py-2 rounded-lg transition-colors duration-300 flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faFileExport} />
                    <span>Generate Report</span>
                  </button>
                  
                  <Link
                    to="/admin/food-list"
                    className="bg-deep-space hover:bg-electric-purple/20 text-silver px-4 py-2 rounded-lg transition-colors duration-300 flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faList} />
                    <span>Food List</span>
                  </Link>
                  
                  <Link
                    to="/admin/add-food"
                    className="bg-scarlet hover:bg-amber text-black px-4 py-2 rounded-lg transition-colors duration-300 flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    <span>Add New Food</span>
                  </Link>
                </div>
              </div>

              <div className="mt-4 text-silver/60 text-sm">
                <span>Dashboard</span>
                <span className="mx-2">/</span>
                <span>Food Management</span>
                <span className="mx-2">/</span>
                <span className="text-amber">Food List</span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search food items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 bg-deep-space border border-silver/20 rounded-lg text-silver focus:outline-none focus:border-amber w-64"
                />
                <FontAwesomeIcon icon={faSearch} className="absolute right-3 top-3 text-silver/50" />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-silver/20">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-silver uppercase tracking-wider">
                      Image
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-silver uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      Name
                      <FontAwesomeIcon icon={faSort} className="ml-2" />
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-silver uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('category')}
                    >
                      Category
                      <FontAwesomeIcon icon={faSort} className="ml-2" />
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-silver uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('price')}
                    >
                      Price
                      <FontAwesomeIcon icon={faSort} className="ml-2" />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-silver uppercase tracking-wider">
                      Ingredients
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-silver uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-silver/20">
                  {filteredFoods.map((food) => (
                    <tr key={food._id} className="hover:bg-silver/5">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={food.imageUrl}
                          alt={food.name}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-silver">
                        {food.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-silver">
                        <span className="px-2 py-1 bg-electric-purple/20 text-electric-purple rounded-full text-xs">
                          {food.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-silver">
                        <div className="flex items-center">
                          <FontAwesomeIcon icon={faDollarSign} className="mr-1 text-amber" />
                          {food.price.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-silver">
                        <div className="max-w-xs truncate">
                          {food.ingrediants}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(food)}
                          className="text-amber hover:text-amber/80 mr-3"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          onClick={() => handleDelete(food._id)}
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

            {/* Edit Modal */}
            {editModalOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-deep-space p-8 rounded-xl max-w-md w-full">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-amber">Edit Food Item</h2>
                    <button
                        onClick={() => {
                          setEditModalOpen(false);
                          navigate(`/admin/food/edit/${editFormData._id}`);
                        }}
                        className="text-silver hover:text-amber"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>

                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-silver mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        className="w-full px-4 py-2 bg-deep-space border border-silver/20 rounded-lg text-silver focus:outline-none focus:border-amber"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-silver mb-2">
                        Category
                      </label>
                      <select
                        value={editFormData.category}
                        onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                        className="w-full px-4 py-2 bg-deep-space border border-silver/20 rounded-lg text-silver focus:outline-none focus:border-amber"
                      >
                        <option value="Food">Food</option>
                        <option value="Drinks">Drinks</option>
                        <option value="Snacks">Snacks</option>
                        <option value="Desserts">Desserts</option>
                        <option value="Beverages">Beverages</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-silver mb-2">
                        Price
                      </label>
                      <input
                        type="number"
                        value={editFormData.price}
                        onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                        className="w-full px-4 py-2 bg-deep-space border border-silver/20 rounded-lg text-silver focus:outline-none focus:border-amber"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-silver mb-2">
                        Ingredients
                      </label>
                      <textarea
                        value={editFormData.ingrediants}
                        onChange={(e) => setEditFormData({ ...editFormData, ingrediants: e.target.value })}
                        rows="3"
                        className="w-full px-4 py-2 bg-deep-space border border-silver/20 rounded-lg text-silver focus:outline-none focus:border-amber resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-silver mb-2">
                        Image URL
                      </label>
                      <input
                        type="text"
                        value={editFormData.imageUrl}
                        onChange={(e) => setEditFormData({ ...editFormData, imageUrl: e.target.value })}
                        className="w-full px-4 py-2 bg-deep-space border border-silver/20 rounded-lg text-silver focus:outline-none focus:border-amber"
                      />
                    </div>
                    <div className="flex justify-end space-x-4 mt-6">
                      <button
                        onClick={() => setEditModalOpen(false)}
                        className="px-4 py-2 text-silver hover:text-amber"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdate}
                        className="px-4 py-2 bg-amber text-black rounded-lg hover:bg-amber/80"
                      >
                        <FontAwesomeIcon icon={faSave} className="mr-2" />
                        Save Changes
                      </button>
                    </div>
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
                    Are you sure you want to delete this food item? This action cannot be undone.
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

export default FoodList;