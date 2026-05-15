import { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUserData({ id: userDoc.id, ...userDoc.data() });
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (identifier, password) => {
    try {
      let email = identifier;
      
      // If it's a 10-digit phone number, find the associated email
      if (/^\d{10}$/.test(identifier)) {
        const q = query(collection(db, 'users'), where('phone', '==', identifier), limit(1));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          throw new Error('No account found with this mobile number.');
        }
        email = querySnapshot.docs[0].data().email;
      }

      const result = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.isBanned) {
          await signOut(auth);
          throw new Error('Your account has been suspended.');
        }

        // AUTO-FIX: If this is the master number but phone is missing in DB
        if (identifier === '7070536545' && data.phone !== '7070536545') {
          await updateDoc(doc(db, 'users', result.user.uid), { phone: '7070536545' });
          data.phone = '7070536545';
        }

        setUserData({ id: userDoc.id, ...data });
      }
      toast.success('Welcome back!');
      return result.user;
    } catch (error) {
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const register = async (email, password, profileData) => {
    try {
      // Check if phone already exists
      if (profileData.phone) {
        const q = query(collection(db, 'users'), where('phone', '==', profileData.phone), limit(1));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          throw new Error('Mobile number already registered.');
        }
      }

      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: profileData.name });

      const userDocData = {
        name: profileData.name,
        email: email,
        phone: profileData.phone || '',
        role: 'user',
        walletBalance: 10,
        totalWins: 0,
        totalLosses: 0,
        referralCode: generateReferralCode(),
        referredBy: profileData.referralCode || '',
        referralEarnings: 0,
        photoURL: '',
        isBanned: false,
        lastBonusClaim: null,
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', result.user.uid), userDocData);
      setUserData({ id: result.user.uid, ...userDocData });

      // Credit referral bonus if referred
      if (profileData.referralCode) {
        await creditReferralBonus(profileData.referralCode);
      }

      toast.success('Account created successfully!');
      return result.user;
    } catch (error) {
      toast.error(error.message || 'Registration failed');
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        const userDocData = {
          name: result.user.displayName || 'User',
          email: result.user.email,
          phone: '',
          role: 'user',
          walletBalance: 10,
          totalWins: 0,
          totalLosses: 0,
          referralCode: generateReferralCode(),
          referredBy: '',
          referralEarnings: 0,
          photoURL: result.user.photoURL || '',
          isBanned: false,
          lastBonusClaim: null,
          createdAt: serverTimestamp(),
        };
        await setDoc(doc(db, 'users', result.user.uid), userDocData);
        setUserData({ id: result.user.uid, ...userDocData });
      } else {
        setUserData({ id: userDoc.id, ...userDoc.data() });
      }

      toast.success('Welcome!');
      return result.user;
    } catch (error) {
      toast.error(error.message || 'Google login failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserData(null);
      toast.success('Logged out');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent!');
    } catch (error) {
      toast.error(error.message || 'Failed to send reset email');
      throw error;
    }
  };

  const refreshUserData = async () => {
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserData({ id: userDoc.id, ...userDoc.data() });
      }
    }
  };

  const generateReferralCode = () => {
    return 'DP' + Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const creditReferralBonus = async (code) => {
    // This would search for user with matching referralCode and credit ₹10
    // Simplified for now
    console.log('Referral bonus credit for code:', code);
  };

  const isAdmin = userData?.phone === '7070536545';

  const value = {
    user,
    userData,
    loading,
    isAdmin,
    login,
    register,
    loginWithGoogle,
    logout,
    resetPassword,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
