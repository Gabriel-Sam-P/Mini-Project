import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import {
  Box, Typography, Snackbar, Alert, Button, IconButton,
  Card, CardContent, CardMedia, CardActions, useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { CartWishlistContext } from './WishlistContext';

const firebaseBaseURL = 'https://e-cart-by-gabriel-default-rtdb.firebaseio.com';

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const { fetchWishlistCount, fetchCartCount } = useContext(CartWishlistContext);
  const username = localStorage.getItem('username');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (username) fetchWishlist();
  }, [username]);

  const fetchWishlist = async () => {
    try {
      const { data } = await axios.get(`${firebaseBaseURL}/wishlist.json`);
      const wishlistArray = [];

      if (data) {
        for (const key in data) {
          if (data[key].username === username) {
            wishlistArray.push({ firebaseKey: key, ...data[key] });
          }
        }
      }
      setWishlist(wishlistArray);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    }
  };

  const handleDelete = async (firebaseKey) => {
    try {
      await axios.delete(`${firebaseBaseURL}/wishlist/${firebaseKey}.json`);
      setWishlist(prev => prev.filter(item => item.firebaseKey !== firebaseKey));
      fetchWishlistCount();
      setSnackbar({ open: true, message: 'Item removed from wishlist.', severity: 'success' });
    } catch (error) {
      console.error('Error deleting wishlist item:', error);
      setSnackbar({ open: true, message: 'Failed to remove item.', severity: 'error' });
    }
  };

  const handleAddToCart = async (item) => {
    if (!username) {
      setSnackbar({ open: true, message: 'Please log in to add to cart.', severity: 'error' });
      return;
    }

    try {
      await axios.post(`${firebaseBaseURL}/cart.json`, {
        ...item,
        quantity: 1,
        username
      });

      await handleDelete(item.firebaseKey);
      fetchCartCount();
    } catch (error) {
      console.error('Error moving item to cart:', error);
      setSnackbar({ open: true, message: 'Failed to move item to cart.', severity: 'error' });
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 4, background: "linear-gradient(to bottom, #00ff99 0%, #3366cc 100%)" }}>
      <Typography variant="h4" align="center" mb={3}>My Wishlist</Typography>

      {wishlist.length === 0 ? (
        <Typography align="center">Your wishlist is empty.</Typography>
      ) : (
        wishlist.map(item => {
          const content = isMobile ? (
            <CardContent>
              <CardMedia
                component="img"
                image={item.image || '/assets/fallback.jpg'}
                alt={item.model}
                onError={(e) => { e.target.src = '/assets/fallback.jpg'; }}
                sx={{
                  height: 180,
                  objectFit: 'contain',
                  mx: 'auto',
                  mb: 1,
                  width: '80%',
                  mt: 1
                }}
              />
              <Typography
                variant="h6"
                align="center"
                fontWeight="bold"
                mb={1}
              >
                {item.company || item.brand}
              </Typography>
              <Typography
                variant="body2"
                align="center"
                sx={{
                  fontSize: '0.9rem',
                  mb: 1,
                  px: 1
                }}
              >
                {item.model}
              </Typography>
              <Typography
                variant="body1"
                align="center"
                color="text.primary"
                fontWeight="bold"
              >
                ₹{item.price}
              </Typography>

              <CardActions
                sx={{
                  justifyContent: 'center',
                  flexDirection: 'row',
                  mt: 2,
                  gap: 1
                }}
              >
                <Button
                  variant="outlined"
                  sx={{
                    color: 'white',
                    backgroundColor: 'blue',
                    fontSize: '0.75rem'
                  }}
                  onClick={() => handleAddToCart(item)}
                  size="small"
                >
                  Add to Cart
                </Button>
                <IconButton color="error" onClick={() => handleDelete(item.firebaseKey)}>
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </CardContent>
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f9f9f9',
                p: 2,
                borderRadius: 2,
                boxShadow: 3
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <img
                  src={item.image || '/assets/fallback.jpg'}
                  alt={item.model}
                  width={90}
                  height={90}
                  style={{ borderRadius: 8, objectFit: 'cover' }}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography fontWeight="bold">{item.company || item.brand}</Typography>
                  <Typography>{item.model}</Typography>
                  <Typography>₹{item.price}</Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Button
                  variant="contained"
                  startIcon={<ShoppingCartIcon />}
                  onClick={() => handleAddToCart(item)}
                  size="small"
                >
                  Add to Cart
                </Button>
                <IconButton color="error" onClick={() => handleDelete(item.firebaseKey)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          );

          return (
            <Card
              key={item.firebaseKey}
              sx={{
                mb: 3,
                borderRadius: 2,
                width: isMobile ? '60vw' : 600,
                maxHeight: isMobile ? '300' : 'none',
                mx: 'auto',
                boxShadow: 3
              }}
            >
              {content}
            </Card>
          );
        })
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WishlistPage;
