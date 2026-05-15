import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const AdminSetup = () => {
  const { user, refreshUserData, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      toast.success('You are already an admin!');
      setTimeout(() => navigate('/admin'), 2000);
    }
  }, [isAdmin, navigate]);

  const handlePromote = async () => {
    if (!user) {
      toast.error('Please login first');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { role: 'admin' });
      await refreshUserData();
      toast.success('Success! You are now an admin.');
      setTimeout(() => navigate('/admin'), 2000);
    } catch (error) {
      toast.error('Failed to promote user: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#06061a] flex items-center justify-center p-4">
      <div className="glass-card-strong p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Admin Access Setup</h1>
        <p className="text-gray-400 mb-6 text-sm">
          Click the button below to grant admin permissions to your current account ({user?.email}).
        </p>
        <button
          onClick={handlePromote}
          disabled={loading || isAdmin}
          className="btn-neon-brand w-full py-3 disabled:opacity-50"
        >
          {loading ? 'Processing...' : isAdmin ? 'Already Admin' : 'Make Me Admin'}
        </button>
      </div>
    </div>
  );
};

export default AdminSetup;
