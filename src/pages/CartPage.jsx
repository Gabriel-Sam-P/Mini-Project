import React, { useEffect, useState, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Grid,
  Divider,
  Stack,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Delete, Add, Remove } from '@mui/icons-material';
import { CartWishlistContext } from './WishlistContext';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();
  const { fetchCartCount } = useContext(CartWishlistContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchCartItems = useCallback(async () => {
    try {
      const username = localStorage.getItem('username');
      if (!username) {
        setSnackbar({ open: true, message: 'Please log in to view cart.', severity: 'warning' });
        navigate('/login');
        return;
      }

      const { data } = await axios.get('http://localhost:3001/cart');
      const userCart = data.filter(item => item.username === username);
      setCartItems(userCart);
    } catch (err) {
      console.error('Error fetching cart items:', err);
    }
  }, [navigate]);

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/cart/${id}`);
      setCartItems(prev => prev.filter(item => item.id !== id));
      fetchCartCount();
      window.dispatchEvent(new Event('updateCounts'));
      setSnackbar({ open: true, message: 'Item removed from cart', severity: 'info' });
    } catch (err) {
      console.error('Error deleting item:', err);
      setSnackbar({ open: true, message: 'Failed to delete item.', severity: 'error' });
    }
  };

  const handleQuantity = async (id, type) => {
    const item = cartItems.find(i => i.id === id);
    const newQty = type === 'inc' ? item.quantity + 1 : Math.max(1, item.quantity - 1);

    try {
      await axios.patch(`http://localhost:3001/cart/${id}`, { quantity: newQty });
      setCartItems(prev =>
        prev.map(i => (i.id === id ? { ...i, quantity: newQty } : i))
      );
    } catch (err) {
      console.error('Error updating quantity:', err);
    }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  const getTotalPrice = () =>
    cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const getFakeDiscount = () => Math.floor(getTotalPrice() * 0.04);
  const getCouponDiscount = () => 117;
  const finalAmount = getTotalPrice() - getFakeDiscount() - getCouponDiscount();

  const handleContinueShopping = () => navigate('/');
  const handleCheckout = () =>
    navigate('/checkout', { state: { total: finalAmount, cart: cartItems } });

  if (cartItems.length === 0) {
    return (
      <Box p={4}  textAlign="center" sx={{ background: 'linear-gradient(to bottom, #66ff99 0%, #99ccff 100%)' }}>
        <Typography variant="h5" gutterBottom>Your cart is empty</Typography>
        <Button variant="contained" onClick={handleContinueShopping}>
          Continue Shopping
        </Button>

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
  }

  return (
    <Box p={{ xs: 2, sm: 3 }} sx={{ background: 'linear-gradient(to bottom, #66ff99 0%, #99ccff 100%)' }}>
      <Typography variant="h4" gutterBottom>Your Cart</Typography>

      <Grid container  spacing={3} justifyContent="center">
        {isMobile ? (
          <Grid size ={{xs:12}} >
            {cartItems.map(item => (
              <Paper key={item.id} sx={{ p: 2, mb: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar src={item.image} variant="square" sx={{ width: 64, height: 64 }} />
                  <Box flex={1}>
                    <Typography fontWeight="bold">{item.brand || item.company} - {item.model}</Typography>
                    <Typography>Price: {formatCurrency(item.price)}</Typography>
                    <Typography>Qty:
                      <IconButton size="small" onClick={() => handleQuantity(item.id, 'dec')}>
                        <Remove fontSize="small" />
                      </IconButton>
                      {item.quantity}
                      <IconButton size="small" onClick={() => handleQuantity(item.id, 'inc')}>
                        <Add fontSize="small" />
                      </IconButton>
                    </Typography>
                    <Typography>Total: {formatCurrency(item.price * item.quantity)}</Typography>
                  </Box>
                  <IconButton onClick={() => handleDelete(item.id)} color="error">
                    <Delete />
                  </IconButton>
                </Stack>
              </Paper>
            ))}
          </Grid>
        ) : (
          <Grid item xs={12} md={8} className="animate__animated animate__bounceInLeft">
            <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Image</TableCell>
                    <TableCell>Product</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Remove</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cartItems.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Avatar src={item.image} variant="square" sx={{ width: 60, height: 60 }} />
                      </TableCell>
                      <TableCell>{item.brand || item.company} - {item.model}</TableCell>
                      <TableCell>{formatCurrency(item.price)}</TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => handleQuantity(item.id, 'dec')}>
                          <Remove fontSize="small" />
                        </IconButton>
                        {item.quantity}
                        <IconButton size="small" onClick={() => handleQuantity(item.id, 'inc')}>
                          <Add fontSize="small" />
                        </IconButton>
                      </TableCell>
                      <TableCell>{formatCurrency(item.price * item.quantity)}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleDelete(item.id)} color="error">
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        )}

        <Grid item xs={12} md={4} className="animate__animated animate__bounceInRight">
          <Paper
            sx={{
              p: 3,
              border: '1px solid #ddd',
              borderRadius: 2,
              position: { md: 'sticky' },
              top: { md: 100 },
            }}
          >
            <Typography variant="h6" gutterBottom>PRICE DETAILS</Typography>
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
              <Button variant="outlined" color="secondary" onClick={handleContinueShopping}>
                CONTINUE SHOPPING
              </Button>
              <Button variant="contained" color="primary" onClick={handleCheckout}>
                PLACE ORDER
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

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
