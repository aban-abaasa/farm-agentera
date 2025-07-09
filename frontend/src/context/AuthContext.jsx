import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token in localStorage and validate it
    const token = localStorage.getItem('token');
    if (token) {
      checkAuthStatus(token);
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuthStatus = async (token) => {
    try {
      // In a real app, you would validate the token with your backend
      // For now, we'll simulate by decoding a user from localStorage
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (userData) {
        setUser(userData);
      }
      setLoading(false);
    } catch (error) {
      console.error('Authentication error:', error);
      logout();
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      // In a real app, this would be an API call to your backend
      // For now, we'll simulate a successful login with mock data
      
      // Simulate API response delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data (in a real app, this would come from your API)
      const userData = {
        id: '1',
        name: 'John Doe',
        email: credentials.email,
        role: 'farmer',
        location: 'Kampala, Uganda',
        avatar: null,
        joinedDate: new Date().toISOString()
      };
      
      // Mock token (in a real app, this would be a JWT from your API)
      const token = 'mock-jwt-token';
      
      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userData', JSON.stringify(userData));
      
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  const register = async (userData) => {
    try {
      // In a real app, this would be an API call to your backend
      // For now, we'll simulate a successful registration with mock data
      
      // Simulate API response delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock registration response
      const newUser = {
        id: Math.floor(Math.random() * 1000).toString(),
        name: userData.name,
        email: userData.email,
        role: userData.role || 'farmer',
        location: userData.location,
        avatar: null,
        joinedDate: new Date().toISOString()
      };
      
      // Mock token
      const token = 'mock-jwt-token';
      
      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userData', JSON.stringify(newUser));
      
      setUser(newUser);
      return newUser;
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setUser(null);
  };

  const updateProfile = async (updatedData) => {
    try {
      // In a real app, this would be an API call to your backend
      // For now, we'll simulate a successful profile update
      
      // Simulate API response delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUser = {
        ...user,
        ...updatedData,
      };
      
      // Update in localStorage
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Profile update error:', error);
      throw new Error(error.response?.data?.message || 'Profile update failed. Please try again.');
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 