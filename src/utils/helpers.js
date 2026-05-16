// Utility helpers for Double Patti

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getRandomName = () => {
  const names = [
    'Rahul K.', 'Priya S.', 'Imtiyaz A.', 'Sneha R.', 'Vikram P.', 'Anjali M.', 'Rajesh D.', 'Pooja T.', 'Arman S.', 'Meera L.',
    'Karan G.', 'Farhan K.', 'Arun K.', 'Divya S.', 'Rohit M.', 'Zoya P.', 'Manoj R.', 'Kavita D.', 'Sanjay T.', 'Ritu B.',
    'Deepak H.', 'Ankit L.', 'Afzal N.', 'Manish J.', 'Kunal B.', 'Pankaj V.', 'Shruti M.', 'Abhishek K.', 'Ayesha S.', 'Yash P.',
    'Ishita D.', 'Sameer G.', 'Sakshi R.', 'Aditya B.', 'Tanya F.', 'Gaurav H.', 'Kajal T.', 'Mustafa W.', 'Preeti J.', 'Aryan N.',
    'Jaya K.', 'Nitin S.', 'Monika G.', 'Harish P.', 'Salim D.', 'Suraj L.', 'Jyoti M.', 'Ravi T.', 'Sana V.', 'Alok R.'
  ];
  return names[Math.floor(Math.random() * names.length)];
};

export const getRandomAmount = () => {
  const amounts = [50000, 150000, 500000];
  return amounts[Math.floor(Math.random() * amounts.length)];
};

export const generateFakeWinners = (count = 10) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    name: getRandomName(),
    amount: getRandomAmount(),
    game: 'Double Patti',
  }));
};

export const maskEmail = (email) => {
  const [name, domain] = email.split('@');
  return name.slice(0, 2) + '***@' + domain;
};

export const maskPhone = (phone) => {
  if (!phone) return '';
  return phone.slice(0, 3) + '****' + phone.slice(-3);
};
