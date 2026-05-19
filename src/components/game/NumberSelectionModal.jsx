import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const NumberSelectionModal = ({ game, onClose, onSubmit }) => {
  const [selected, setSelected] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [betAmount, setBetAmount] = useState(10);

  const amounts = [10, 20, 50, 100];

  // Generate numbers 0 to 9
  const numbers = Array.from({ length: 10 }, (_, i) => i);

  const toggleNumber = (num) => {
    if (selected.includes(num)) {
      setSelected(selected.filter(n => n !== num));
    } else {
      if (selected.length >= 2) {
        toast.error('You can only select exactly 2 numbers.');
        return;
      }
      setSelected([...selected, num]);
    }
  };

  const handleSubmit = async () => {
    if (selected.length !== 2) {
      toast.error('Please select exactly 2 numbers.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(selected, betAmount);
      onClose();
    } catch (error) {
      console.error("Betting error:", error);
      toast.error(error.message || 'Failed to place bet. Try again.');
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4 sm:px-6 pt-10 pb-10"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 30, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-[#0b0c1b] p-5 sm:p-6 w-full max-w-lg flex flex-col relative overflow-hidden rounded-2xl border border-indigo-500/30 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Background Glow */}
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-indigo-600/20 blur-[80px] pointer-events-none" />
          
          <div className="relative mb-5 z-10 shrink-0 text-center">
            <h2 className="font-outfit font-black text-xl sm:text-2xl text-white uppercase tracking-tight">{game.title}</h2>
            <p className="text-gray-400 text-xs mt-1">Pick exactly <span className="text-amber-400 font-bold">2 numbers</span> (0-9)</p>
            <button 
              onClick={onClose}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar relative z-10 pb-4">
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {numbers.map(num => {
                const isSelected = selected.includes(num);
                return (
                  <button
                    key={num}
                    onClick={() => toggleNumber(num)}
                    className={`aspect-square rounded-xl flex items-center justify-center text-base sm:text-lg font-black transition-all ${
                      isSelected 
                        ? 'bg-gradient-to-br from-indigo-500 to-fuchsia-600 text-white shadow-lg border border-white/20' 
                        : 'bg-slate-800/50 text-gray-400 border border-white/5 hover:bg-slate-700/50 hover:text-white'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10 relative z-10 shrink-0">
            <div className="mb-6">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider block mb-3 text-center">Select Bet Amount</span>
              <div className="flex gap-3 justify-center">
                {amounts.map(amt => (
                  <button
                    key={amt}
                    onClick={() => setBetAmount(amt)}
                    className={`flex-1 max-w-[100px] py-2.5 rounded-xl font-bold border transition-all ${
                      betAmount === amt
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-400 font-medium">Selected:</span>
              <div className="flex gap-2">
                {selected.length === 0 ? (
                  <span className="text-sm text-gray-500 italic">None</span>
                ) : (
                  selected.map(n => (
                    <span key={n} className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center text-indigo-300 font-bold text-sm">
                      {n}
                    </span>
                  ))
                )}
              </div>
            </div>
            
            <motion.button 
              whileTap={{ scale: selected.length === 2 ? 0.95 : 1 }}
              disabled={selected.length !== 2 || submitting}
              onClick={handleSubmit}
              className={`w-full py-3.5 sm:py-4 rounded-xl font-black text-base sm:text-lg transition-all flex items-center justify-center gap-2 ${
                selected.length === 2 && !submitting
                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg hover:shadow-xl'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {submitting ? 'Placing Bet...' : `Confirm: ₹${betAmount}`}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NumberSelectionModal;
