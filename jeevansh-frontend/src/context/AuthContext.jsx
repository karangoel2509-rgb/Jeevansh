import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [donor, setDonor] = useState(() => {
    const saved = localStorage.getItem('jeevansh_donor');
    return saved ? JSON.parse(saved) : null;
  });
  const [bank, setBank] = useState(() => {
    const saved = localStorage.getItem('jeevansh_bank');
    return saved ? JSON.parse(saved) : null;
  });

  const loginDonor = (data) => {
    setDonor(data.donor);
    localStorage.setItem('jeevansh_donor', JSON.stringify(data.donor));
  };

  const loginBank = (data) => {
    setBank(data.bank);
    localStorage.setItem('jeevansh_bank', JSON.stringify(data.bank));
  };

  const logout = () => {
    setDonor(null);
    setBank(null);
    localStorage.removeItem('jeevansh_donor');
    localStorage.removeItem('jeevansh_bank');
  };

  return (
    <AuthContext.Provider value={{ donor, bank, loginDonor, loginBank, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);