import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const CartWishlistContext = createContext();

export const CartWishlistProvider = ({ children }) => {
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  const fetchWishlistCount = async () => {
    const username = localStorage.getItem('username');
    const res = await axios.get('http://localhost:3001/wishlist');
    const count = res.data.filter(item => item.username === username).length;
    setWishlistCount(count);
  };

  const fetchCartCount = async () => {
    const username = localStorage.getItem('username');
    const res = await axios.get('http://localhost:3001/cart');
    const count = res.data.filter(item => item.username === username).length;
    setCartCount(count);
  };

  useEffect(() => {
    fetchWishlistCount();
    fetchCartCount();

    const listener = () => {
      fetchWishlistCount();
      fetchCartCount();
    };

    window.addEventListener('updateCounts', listener);
    return () => window.removeEventListener('updateCounts', listener);
  }, []);

  return (
    <CartWishlistContext.Provider value={{ wishlistCount, cartCount, fetchWishlistCount, fetchCartCount }}>
      {children}
    </CartWishlistContext.Provider>
  );
};
