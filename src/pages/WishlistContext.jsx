import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const CartWishlistContext = createContext();

const firebaseBaseURL = 'https://e-cart-by-gabriel-default-rtdb.firebaseio.com';

export const CartWishlistProvider = ({ children }) => {
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  const username = localStorage.getItem('username');

  const fetchWishlistCount = useCallback(async () => {
    if (!username) {
      setWishlistCount(0);
      return;
    }
    try {
      const { data } = await axios.get(`${firebaseBaseURL}/wishlist.json`);
      const items = data ? Object.values(data) : [];
      const count = items.filter(item => item.username === username).length;
      setWishlistCount(count);
    } catch (err) {
      console.error('Failed to fetch wishlist count:', err);
      setWishlistCount(0);
    }
  }, [username]);

  const fetchCartCount = useCallback(async () => {
    if (!username) {
      setCartCount(0);
      return;
    }
    try {
      const { data } = await axios.get(`${firebaseBaseURL}/cart.json`);
      const items = data ? Object.values(data) : [];
      const count = items.filter(item => item.username === username).length;
      setCartCount(count);
    } catch (err) {
      console.error('Failed to fetch cart count:', err);
      setCartCount(0);
    }
  }, [username]);

  useEffect(() => {
    fetchWishlistCount();
    fetchCartCount();

    const handleUpdate = () => {
      fetchWishlistCount();
      fetchCartCount();
    };

    window.addEventListener('updateCounts', handleUpdate);
    return () => window.removeEventListener('updateCounts', handleUpdate);
  }, [fetchWishlistCount, fetchCartCount]);

  return (
    <CartWishlistContext.Provider value={{ wishlistCount, cartCount, fetchWishlistCount, fetchCartCount }}>
      {children}
    </CartWishlistContext.Provider>
  );
};
