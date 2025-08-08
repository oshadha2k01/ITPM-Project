import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChair, faTimes } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-hot-toast';

const SeatSelection = ({ isOpen, onClose, onSelect, selectedSeats = [], bookedSeats = [], maxSeats = 4, isEditMode = false }) => {
  const rows = ['A', 'B', 'C', 'D', 'E'];
  const seatsPerRow = 10;
  const seatPrice = 500; // Cost per seat in rupees

  const isSeatBooked = (seatNumber) => {
    if (isEditMode) {
      return bookedSeats.includes(seatNumber) && !selectedSeats.includes(seatNumber);
    }
    return bookedSeats.includes(seatNumber);
  };

  const isSeatSelected = (seatNumber) => {
    return selectedSeats.includes(seatNumber);
  };

  const handleSeatClick = (seatNumber) => {
    if (!isSeatBooked(seatNumber)) {
      if (isSeatSelected(seatNumber)) {
        const newSelectedSeats = selectedSeats.filter(seat => seat !== seatNumber);
        onSelect(newSelectedSeats, newSelectedSeats.length * seatPrice);
      } else {
        if (selectedSeats.length < maxSeats) {
          const newSelectedSeats = [...selectedSeats, seatNumber];
          onSelect(newSelectedSeats, newSelectedSeats.length * seatPrice);
        } else {
          toast.error(`You can only select up to ${maxSeats} seats`);
        }
      }
    }
  };

  const handleConfirm = () => {
    if (selectedSeats.length > 0) {
      onClose();
    } else {
      toast.error('Please select at least one seat before confirming');
    }
  };

  const totalAmount = selectedSeats.length * seatPrice;

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-deep-space rounded-xl p-6 max-w-4xl w-full mx-4"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-amber">
            {isEditMode ? 'Change Your Seats' : 'Select Your Seats'}
          </h2>
          <button onClick={onClose} className="text-silver/70 hover:text-silver">
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>

        <div className="mb-8">
          <div className="bg-silver/10 rounded-lg p-4 text-center">
            <div className="h-2 bg-amber/20 rounded-full"></div>
            <p className="text-silver mt-2">SCREEN</p>
          </div>
        </div>

        <div className="flex justify-center gap-6 mb-6">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faChair} className="text-silver" />
            <span className="text-silver text-sm">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faChair} className="text-amber" />
            <span className="text-silver text-sm">
              Selected
              {selectedSeats.length > 0 && (
                <span className="text-amber ml-1">: {selectedSeats.join(', ')}</span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faChair} className="text-scarlet" />
            <span className="text-silver text-sm">Booked</span>
          </div>
        </div>

        <div className="space-y-4">
          {rows.map((row) => (
            <div key={row} className="flex justify-center gap-2">
              <div className="w-8 text-center text-silver">{row}</div>
              {Array.from({ length: seatsPerRow }, (_, i) => {
                const seatNumber = `${row}${i + 1}`;
                const isBooked = isSeatBooked(seatNumber);
                const isSelected = isSeatSelected(seatNumber);
                return (
                  <button
                    key={seatNumber}
                    onClick={() => handleSeatClick(seatNumber)}
                    disabled={isBooked}
                    className={`w-8 h-8 rounded flex items-center justify-center transition-colors duration-200 ${
                      isBooked
                        ? 'bg-scarlet cursor-not-allowed'
                        : isSelected
                        ? 'bg-amber text-black'
                        : 'bg-silver/20 hover:bg-silver/30 text-silver'
                    }`}
                  >
                    <FontAwesomeIcon icon={faChair} />
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="mt-6 text-center space-y-2">
          <p className="text-silver">
            Selected Seats: <span className="font-bold text-amber">
              {selectedSeats.join(', ') || 'None'}
            </span>
          </p>
          <p className="text-silver text-sm">
            {selectedSeats.length}/{maxSeats} seats selected
          </p>
          <p className="text-silver">
            Total Amount: <span className="font-bold text-amber">
              Rs{totalAmount.toLocaleString('en-IN')}
            </span>
          </p>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={handleConfirm}
            disabled={selectedSeats.length === 0}
            className={`px-6 py-2 rounded-lg transition-colors duration-300 ${
              selectedSeats.length === 0
                ? 'bg-deep-space/50 text-silver/50 cursor-not-allowed'
                : 'bg-amber text-black hover:bg-amber/90'
            }`}
          >
            {isEditMode ? 'Update Selection' : 'Confirm Selection'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SeatSelection;
