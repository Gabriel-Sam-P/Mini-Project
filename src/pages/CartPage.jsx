import React, { useEffect, useState, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box, Typography, IconButton, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Avatar, Grid, Divider,
  Stack, Snackbar, Alert, useMediaQuery, useTheme
} from '@mui/material';
import { Delete, Add, Remove } from '@mui/icons-material';
import { CartWishlistContext } from './WishlistContext';

const FIREBASE_URL = 'https://e-cart-by-gabriel-default-rtdb.firebaseio.com';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();
  const { fetchCartCount } = useContext(CartWishlistContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const username = localStorage.getItem('username');

  const fetchCartItems = useCallback(async () => {
    if (!username) {
      setSnackbar({ open: true, message: 'Please log in to view cart.', severity: 'warning' });
      navigate('/login');
      return;
    }
    try {
      const { data } = await axios.get(`${FIREBASE_URL}/cart.json`);
      const allItems = data
        ? Object.entries(data).map(([key, value]) => ({ firebaseId: key, ...value }))
        : [];
      const userItems = allItems.filter(item => item.username === username);
      setCartItems(userItems);
    } catch (err) {
      console.error('Error fetching cart items:', err);
    }
  }, [username, navigate]);

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  const handleDelete = async (firebaseId) => {
    try {
      await axios.delete(`${FIREBASE_URL}/cart/${firebaseId}.json`);
      setCartItems(prev => prev.filter(item => item.firebaseId !== firebaseId));
      fetchCartCount();
      window.dispatchEvent(new Event('updateCounts'));
      setSnackbar({ open: true, message: 'Item removed from cart', severity: 'info' });
    } catch (err) {
      console.error('Error deleting item:', err);
      setSnackbar({ open: true, message: 'Failed to delete item.', severity: 'error' });
    }
  };

  const handleQuantity = async (firebaseId, currentQuantity, type) => {
    const newQty = type === 'inc' ? currentQuantity + 1 : Math.max(1, currentQuantity - 1);
    try {
      await axios.patch(`${FIREBASE_URL}/cart/${firebaseId}.json`, { quantity: newQty });
      setCartItems(prev =>
        prev.map(item => (item.firebaseId === firebaseId ? { ...item, quantity: newQty } : item))
      );
    } catch (err) {
      console.error('Error updating quantity:', err);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  const getTotalPrice = () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const getFakeDiscount = () => Math.floor(getTotalPrice() * 0.04);
  const getCouponDiscount = () => 117;
  const finalAmount = getTotalPrice() - getFakeDiscount() - getCouponDiscount();

  const handleContinueShopping = () => navigate('/');
  const handleCheckout = () => navigate('/checkout', { state: { total: finalAmount, cart: cartItems } });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #00ff99 0%, #3366cc 100%)',
        py: 4,
      }}
    >
      <Typography variant="h4" align="center" gutterBottom>Your Cart</Typography>

      {cartItems.length === 0 ? (
        <Box textAlign="center" sx={{ mt: 4 }}>
          <Typography variant="h6">Your cart is empty</Typography>
          <Button variant="contained" onClick={handleContinueShopping} sx={{ mt: 2 }}>
            Continue Shopping
          </Button>
        </Box>
      ) : (
        <Grid container spacing={4} justifyContent="center" sx={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Grid item xs={12} md={8}>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Image</TableCell>
                    <TableCell>Product</TableCell>
                    {!isMobile && <TableCell>Price</TableCell>}
                    <TableCell>Quantity</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Remove</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cartItems.map(item => (
                    <TableRow key={item.firebaseId}>
                      <TableCell>
                        <Avatar src={item.image} variant="square" sx={{ width: 60, height: 60 }} />
                      </TableCell>
                      <TableCell>{item.brand || item.company} - {item.model}</TableCell>
                      {!isMobile && <TableCell>{formatCurrency(item.price)}</TableCell>}
                      <TableCell>
                        <IconButton size="small" onClick={() => handleQuantity(item.firebaseId, item.quantity, 'dec')}>
                          <Remove fontSize="small" />
                        </IconButton>
                        {item.quantity}
                        <IconButton size="small" onClick={() => handleQuantity(item.firebaseId, item.quantity, 'inc')}>
                          <Add fontSize="small" />
                        </IconButton>
                      </TableCell>
                      <TableCell>{formatCurrency(item.price * item.quantity)}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleDelete(item.firebaseId)} color="error">
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6">PRICE DETAILS</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography>Price ({cartItems.length} items)</Typography>
                <Typography>{formatCurrency(getTotalPrice())}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography>Discount</Typography>
                <Typography sx={{ color: 'green' }}>- {formatCurrency(getFakeDiscount())}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography>Coupons</Typography>
                <Typography sx={{ color: 'green' }}>- {formatCurrency(getCouponDiscount())}</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="subtitle1"><strong>Total Amount</strong></Typography>
                <Typography variant="subtitle1"><strong>{formatCurrency(finalAmount)}</strong></Typography>
              </Box>
              <Typography variant="body2" color="green">
                You will save {formatCurrency(getFakeDiscount() + getCouponDiscount())} on this order
              </Typography>

              <Stack spacing={2} mt={3}>
                <Button variant="outlined" color="secondary" onClick={handleContinueShopping}>CONTINUE SHOPPING</Button>
                <Button variant="contained" color="primary" onClick={handleCheckout}>PLACE ORDER</Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CartPage;
