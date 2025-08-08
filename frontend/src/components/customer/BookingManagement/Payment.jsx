import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faUser, faLock, faCalendarAlt, faDownload } from '@fortawesome/free-solid-svg-icons';
import MainNavBar from '../../navbar/MainNavBar';
import { jsPDF } from 'jspdf';

const Payment = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { booking, totalAmount } = state || {};
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails((prev) => ({ ...prev, [name]: value }));
  };

  // Load QRCode library from CDN
  const loadQRCodeLibrary = () => {
    return new Promise((resolve, reject) => {
      if (window.QRCode) {
        resolve(window.QRCode);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js';
      script.async = true;
      script.onload = () => resolve(window.QRCode);
      script.onerror = () => reject(new Error('Failed to load QRCode library'));
      document.head.appendChild(script);
    });
  };

  // Generate and download a user-friendly PDF report with QR code
  const generatePDF = async () => {
    const doc = new jsPDF();
    
    // Set fonts and colors
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(33, 33, 33); // Dark gray for professional look

    // Header
    doc.text('Movie Booking Confirmation', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for choosing our theater!', 105, 30, { align: 'center' });

    // Horizontal line
    doc.setLineWidth(0.5);
    doc.setDrawColor(150, 150, 150);
    doc.line(20, 40, 190, 40);

    // Booking Details Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Booking Details', 20, 50);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const details = [
      { label: 'Movie:', value: booking.movieName },
      { label: 'Date:', value: booking.movieDate },
      { label: 'Time:', value: booking.movieTime },
      { label: 'Seats:', value: Array.isArray(booking.seatNumbers) ? booking.seatNumbers.join(', ') : booking.seatNumbers },
      { label: 'Customer Name:', value: booking.name },
      { label: 'Total Amount:', value: `Rs${totalAmount.toLocaleString('en-IN')}` }
    ];

    let yPos = 60;
    details.forEach((item) => {
      doc.setFont('helvetica', 'bold');
      doc.text(item.label, 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(item.value, 60, yPos);
      yPos += 10;
    });

    // QR Code Section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('QR Code:', 20, yPos);
    yPos += 10;
    try {
      const QRCode = await loadQRCodeLibrary();
      const qrCodeUrl = `http://localhost:3000/booking-details/${booking._id}`;
      const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl, {
        width: 80,
        margin: 1
      });
      doc.addImage(qrCodeDataUrl, 'PNG', 20, yPos, 50, 50);
      doc.setFont('helvetica', 'normal');
      doc.text('Scan to view booking details', 75, yPos + 25);
      yPos += 60;
    } catch (error) {
      console.error('Error generating QR code:', error);
      doc.setFont('helvetica', 'normal');
      doc.text('QR code could not be generated', 20, yPos);
      yPos += 10;
    }

    // Horizontal line
    doc.line(20, yPos, 190, yPos);
    yPos += 10;

    // Instructions
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Please present this confirmation at the theater entrance.', 20, yPos);
    yPos += 10;
    doc.text('For any inquiries, contact our support team at support@movietheater.com.', 20, yPos);

    // Footer
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Movie Theater Inc. | www.movietheater.com', 105, 280, { align: 'center' });

    // Save the PDF
    doc.save(`booking_confirmation_${booking._id}.pdf`);
  };

  // Handle payment submission
  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setPaymentSuccess(true);
      toast.success('Payment successful! You can download your booking details below.');
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!booking || !totalAmount) {
    return (
      <div className="min-h-screen bg-deep-space text-silver flex items-center justify-center">
        <div className="text-2xl text-amber">Invalid booking details</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-space text-silver py-12">
      <Toaster position="top-right" />
      <MainNavBar />
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-electric-purple/10 rounded-xl p-8 border border-silver/10 shadow-lg">
            <h1 className="text-3xl font-bold text-amber mb-8">Payment</h1>

            {/* Booking Summary */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-amber mb-4">Booking Summary</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-amber mb-2">Movie</h3>
                  <p className="text-silver">{booking.movieName}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-amber mb-2">Date</h3>
                  <p className="text-silver">{booking.movieDate}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-amber mb-2">Time</h3>
                  <p className="text-silver">{booking.movieTime}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-amber mb-2">Seats</h3>
                  <p className="text-silver">
                    {Array.isArray(booking.seatNumbers) ? booking.seatNumbers.join(', ') : booking.seatNumbers}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-amber mb-2">Customer Name</h3>
                  <p className="text-silver">{booking.name}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-amber mb-2">Total Amount</h3>
                  <p className="text-silver font-bold">Rs{totalAmount.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div>
              <h2 className="text-2xl font-semibold text-amber mb-4">Payment Details</h2>
              <form onSubmit={handlePayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-silver mb-2">Card Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="cardNumber"
                      value={paymentDetails.cardNumber}
                      onChange={handleInputChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      className="w-full px-4 py-2 bg-deep-space border border-silver/20 rounded-lg text-silver focus:outline-none focus:border-amber pl-10"
                    />
                    <FontAwesomeIcon
                      icon={faCreditCard}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-silver"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-silver mb-2">Card Holder Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="cardHolder"
                      value={paymentDetails.cardHolder}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className="w-full px-4 py-2 bg-deep-space border border-silver/20 rounded-lg text-silver focus:outline-none focus:border-amber pl-10"
                    />
                    <FontAwesomeIcon
                      icon={faUser}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-silver"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-silver mb-2">Expiry Date</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="expiryDate"
                        value={paymentDetails.expiryDate}
                        onChange={handleInputChange}
                        placeholder="MM/YY"
                        maxLength="5"
                        className="w-full px-4 py-2 bg-deep-space border border-silver/20 rounded-lg text-silver focus:outline-none focus:border-amber pl-10"
                      />
                      <FontAwesomeIcon
                        icon={faCalendarAlt}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-silver"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-silver mb-2">CVV</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="cvv"
                        value={paymentDetails.cvv}
                        onChange={handleInputChange}
                        placeholder="123"
                        maxLength="4"
                        className="w-full px-4 py-2 bg-deep-space border border-silver/20 rounded-lg text-silver focus:outline-none focus:border-amber pl-10"
                      />
                      <FontAwesomeIcon
                        icon={faLock}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-silver"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-6 space-x-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-6 py-3 bg-amber text-deep-space rounded-lg flex items-center text-lg ${
                      loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-amber/80'
                    }`}
                  >
                    <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
                    {loading ? 'Processing...' : 'Pay Now'}
                  </button>
                  {paymentSuccess && (
                    <button
                      type="button"
                      onClick={generatePDF}
                      className="px-6 py-3 bg-scarlet text-white rounded-lg flex items-center text-lg hover:bg-scarlet/80"
                    >
                      <FontAwesomeIcon icon={faDownload} className="mr-2" />
                      Download Report
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Payment;