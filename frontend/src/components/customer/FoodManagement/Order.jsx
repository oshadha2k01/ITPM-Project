import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, 
  faTrash, 
  faCheck, 
  faTimes,
  faCreditCard,
  faMoneyBill,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingOrder, setEditingOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/orders`);
      console.log('API Response:', response.data.data); // Debug log
      const data = Array.isArray(response.data.data) ? response.data.data : [];
      setOrders(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/${orderId}`, {
        status: newStatus
      });
      toast.success('Order status updated successfully');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleDelete = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/orders/${orderId}`);
        toast.success('Order deleted successfully');
        fetchOrders();
      } catch (error) {
        console.error('Error deleting order:', error);
        toast.error('Failed to delete order');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'text-green-500';
      case 'cancelled':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getPaymentIcon = (paymentMethod) => {
    return paymentMethod === 'card' ? (
      <FontAwesomeIcon icon={faCreditCard} className="text-blue-500" />
    ) : (
      <FontAwesomeIcon icon={faMoneyBill} className="text-green-500" />
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-amber" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-space pt-16 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-amber mb-8">Order Management</h1>
        
        <div className="bg-electric-purple/10 rounded-lg p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-silver/20">
                  <th className="pb-4 text-silver">Order ID</th>
                  <th className="pb-4 text-silver">Items</th>
                  <th className="pb-4 text-silver">Total</th>
                  <th className="pb-4 text-silver text-balance">Payment Method</th>
                  
                  <th className="pb-4 text-silver">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(orders) && orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order._id} className="border-b border-silver/10">
                      <td className="py-4 text-silver">{order._id}</td>
                      <td className="py-4 text-silver">
                        {order.meals.map((meal, index) => (
                          <div key={index} className="text-sm">
                            {meal.food ? `${meal.food.name} × ${meal.quantity}` : `Unknown Item × ${meal.quantity}`}
                          </div>
                        ))}
                      </td>
                      <td className="py-4 text-amber">${order.totalprice.toFixed(2)}</td>
                      <td className="py-4 text-justify">{getPaymentIcon(order.paymentMethod)}</td>
                      
                      <td className="py-4">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleDelete(order._id)}
                            className="text-red-500 hover:text-red-600"
                            title="Delete Order"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-4 text-silver text-center">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ToastContainer theme="dark" />
    </div>
  );
};

export default Order;