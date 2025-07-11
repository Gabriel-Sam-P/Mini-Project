import React, { useEffect, useState, useContext, useCallback } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Snackbar,
  Alert,
  Button,
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { CartWishlistContext } from './WishlistContext';

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const { fetchWishlistCount, fetchCartCount } = useContext(CartWishlistContext);

  const username = localStorage.getItem('username');

  const fetchWishlist = useCallback(async () => {
    if (!username) {
      setSnackbar({
        open: true,
        message: 'Please log in to view your wishlist.',
        severity: 'error'
      });
      return;
    }

    try {
      const { data } = await axios.get('http://localhost:3001/wishlist');
      const userWishlist = data.filter(item => item.username === username);
      setWishlist(userWishlist);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load wishlist.',
        severity: 'error'
      });
    }
  }, [username]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const removeFromWishlistState = (id) => {
    setWishlist(prev => prev.filter(item => item.id !== id));
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/wishlist/${id}`);
      removeFromWishlistState(id);
      setSnackbar({
        open: true,
        message: 'Item removed from wishlist.',
        severity: 'success'
      });
      fetchWishlistCount();
      window.dispatchEvent(new Event('updateCounts'));
    } catch (error) {
      console.error('Error deleting wishlist item:', error);
      setSnackbar({
        open: true,
        message: 'Failed to remove item.',
        severity: 'error'
      });
    }
  };

  const handleAddToCart = async (item) => {
    if (!username) {
      setSnackbar({
        open: true,
        message: 'Please log in to add to cart.',
        severity: 'error'
      });
      return;
    }

    try {
      const { data: cartItems } = await axios.get('http://localhost:3001/cart');
      const alreadyInCart = cartItems.some(
        cartItem =>
          cartItem.model === item.model &&
          cartItem.company === item.company &&
          cartItem.username === username
      );

      if (alreadyInCart) {
        setSnackbar({
          open: true,
          message: 'Item already in cart.',
          severity: 'info'
        });
        return;
      }

      const itemWithQty = { ...item, quantity: 1, username };
      delete itemWithQty.id;

      await axios.post('http://localhost:3001/cart', itemWithQty);
      await axios.delete(`http://localhost:3001/wishlist/${item.id}`);

      removeFromWishlistState(item.id);

      setSnackbar({
        open: true,
        message: 'Item moved to cart.',
        severity: 'success'
      });

      fetchCartCount();
      fetchWishlistCount();
      window.dispatchEvent(new Event('updateCounts'));
    } catch (error) {
      console.error('Error moving item to cart:', error);
      setSnackbar({
        open: true,
        message: 'Failed to move item to cart.',
        severity: 'error'
      });
    }
  };

  return (
    <Box sx={{ p: 4, background: 'linear-gradient(to bottom, #cc33ff 0%, #0066ff 100%)', color: "black" }}>
      <Typography variant="h4" align="center" sx={{ mb: 4 }}>
        My Wishlist
      </Typography>

      {wishlist.length === 0 ? (
        <Typography align="center">Your wishlist is empty.</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', rowGap:2 }}>
          {wishlist.map((item) => (
            <Box
              className="animate__animated animate__backInLeft"
              key={item.id}
              sx={{
                display: 'flex',
                backgroundColor: 'white',
                gap: 3,
                alignItems: 'center',
                borderBottom: '1px solid #ccc',
                pb: 2
              }}
            >
              <Box
                component="img"
                src={item.image || '/assets/fallback.jpg'}
                alt={item.model}
                onError={(e) => {
                  const target = e.target;
                  if (target instanceof HTMLImageElement) {
                    target.src = '/assets/fallback.jpg';
                  }
                }}
                sx={{ width: 120, height: 100, objectFit: 'contain' }}
              />

              <Box sx={{ flex: 1 }}>
                <Typography variant="h6">{item.company || item.brand}</Typography>
                <Typography variant="body2" sx={{ my: 1 }}>
                  {item.description}
                </Typography>
                <Typography variant="h6">
                  ₹{item.price}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<ShoppingCartIcon />}
                  onClick={() => handleAddToCart(item)}
                >
                  Add to Cart
                </Button>
                <IconButton color="error" onClick={() => handleDelete(item.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={(event, reason) => {
          if (reason === 'clickaway') return;
          setSnackbar({ ...snackbar, open: false });
        }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WishlistPage;
