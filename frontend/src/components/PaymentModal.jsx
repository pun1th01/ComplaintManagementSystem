import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { X, CreditCard, ShieldCheck } from 'lucide-react';

export default function PaymentModal({ isOpen, onClose, onSuccess, amount = 500 }) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePayment = async () => {
    setIsProcessing(true);
    toast.loading('Processing payment via DONTPAY...', { id: 'payment-toast' });
    
    // Simulate 2 second delayed payment validation
    setTimeout(() => {
      toast.success('Payment Successful via DONTPAY', { id: 'payment-toast' });
      setIsProcessing(false);
      onSuccess(); // Ensure booking API runs only after success toast
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-all duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative animate-in fade-in zoom-in duration-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button 
            onClick={onClose}
            disabled={isProcessing}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-indigo-500 p-2 rounded-lg">
              <CreditCard size={24} className="text-white" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">DONTPAY Checkout</h2>
          </div>
          <p className="text-slate-300 text-sm flex items-center gap-1">
            <ShieldCheck size={14} className="text-green-400" /> Secure 256-bit Encryption
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
            <span className="text-gray-600 font-medium">Hostel Room Allotment Fee</span>
            <span className="text-2xl font-black text-gray-900">₹{amount}</span>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-4 border-2 border-indigo-500 bg-indigo-50 rounded-xl cursor-pointer transition-all">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-black text-sm pr-1 italic">DP</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900 leading-none">Wallet balance</p>
                  <p className="text-xs text-gray-500 mt-1">Instant Settlement</p>
                </div>
              </div>
              <div className="w-5 h-5 rounded-full border-4 border-indigo-600 bg-white shadow-inner"></div>
            </label>
          </div>

          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Pay with DONTPAY'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
