import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const userList = await api.getUsers();
      setUsers(userList);

      const savedUserId = localStorage.getItem('activeUserId');
      const matched = userList.find((u) => u.id === savedUserId);
      if (matched) {
        setActiveUser(matched);
      } else if (userList.length > 0) {
        setActiveUser(userList[0]);
        localStorage.setItem('activeUserId', userList[0].id);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  }

  function switchUser(user) {
    setActiveUser(user);
    localStorage.setItem('activeUserId', user.id);
  }

  return (
    <AuthContext.Provider
      value={{
        users,
        activeUser,
        switchUser,
        loading,
        refreshUsers: loadUsers
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
