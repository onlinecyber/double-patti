import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, doc, updateDoc, increment, onSnapshot, runTransaction } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Generate two unique random numbers between 0-9
export const generateRandomNumbers = () => {
  const num1 = Math.floor(Math.random() * 10);
  let num2 = Math.floor(Math.random() * 10);
  while (num2 === num1) {
    num2 = Math.floor(Math.random() * 10);
  }
  return [num1, num2];
};

// Determine the winning number from the two generated (Legacy)
export const generateWinningNumber = (numbers) => {
  const idx = Math.random() < 0.5 ? 0 : 1;
  return numbers[idx];
};

export const placeBet = async (userId, gameId, gameTitle, numbers, entryFee) => {
  try {
    await runTransaction(db, async (transaction) => {
      const userRef = doc(db, 'users', userId);
      const userSnap = await transaction.get(userRef);
      
      if (!userSnap.exists()) throw new Error("User does not exist!");
      const currentBalance = userSnap.data().walletBalance || 0;
      
      if (currentBalance < entryFee) {
        throw new Error("Insufficient balance!");
      }

      // 1. Deduct wallet
      transaction.update(userRef, { 
        walletBalance: increment(-entryFee) 
      });

      // 2. Add wallet transaction
      const walletRef = doc(collection(db, 'wallet'));
      transaction.set(walletRef, {
        userId, type: 'debit', amount: entryFee, description: `Joined ${gameTitle}`, createdAt: serverTimestamp()
      });

      // 3. Create active bet
      const betRef = doc(collection(db, 'activeBets'));
      transaction.set(betRef, {
        userId,
        gameId,
        gameTitle,
        numbers,
        entryFee,
        status: 'waiting',
        prize: 0,
        winningNumber: null,
        createdAt: serverTimestamp(),
      });
    });
    return true;
  } catch (error) {
    console.error("Bet placement failed:", error);
    throw error;
  }
};

export const listenToActiveBet = (userId, gameId, callback) => {
  const q = query(
    collection(db, 'activeBets'),
    where('userId', '==', userId),
    where('gameId', '==', gameId)
  );
  
  return onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      callback(null);
      return;
    }
    // Since a user can only bet once per game, we take the first matching document
    // Sort by createdAt just in case to get latest if duplicates exist, but query handles it simply.
    // For MVP, we assume 1 active bet per game per user.
    const bets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Return the most recently created or just the first
    callback(bets[0]);
  });
};

// Get game history for a user
export const getGameHistory = async (userId) => {
  try {
    const q = query(
      collection(db, 'activeBets'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error("Game history error:", error);
    return [];
  }
};

// Get active games
export const getActiveGames = async () => {
  try {
    const q = query(collection(db, 'games'), where('status', '==', 'open'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch {
    return [];
  }
};

// Default game cards (used when no Firestore games exist)
export const defaultGames = [
  {
    id: 'double-patti-20',
    title: 'Double Patti',
    entryFee: 20,
    prizePool: 50000,
    icon: '🎰',
    color: 'from-amber-600 to-amber-900',
    openingTime: '09:30 AM',
    closingTime: '10:00 AM',
  },
  {
    id: 'double-patti-1230',
    title: 'Double Patti',
    entryFee: 30,
    prizePool: 80000,
    icon: '🎲',
    color: 'from-emerald-600 to-emerald-900',
    openingTime: '12:30 PM',
    closingTime: '01:00 PM',
  },
  {
    id: 'double-patti-50',
    title: 'Double Patti',
    entryFee: 50,
    prizePool: 150000,
    icon: '🎴',
    color: 'from-red-600 to-red-900',
    openingTime: '07:30 PM',
    closingTime: '08:00 PM',
  },
  {
    id: 'double-patti-100',
    title: 'Double Patti',
    entryFee: 100,
    prizePool: 500000,
    icon: '🃏',
    color: 'from-purple-600 to-purple-900',
    openingTime: '09:30 PM',
    closingTime: '10:00 PM',
  },
];
