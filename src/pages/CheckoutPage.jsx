import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Divider, Avatar, Button,
  Radio, RadioGroup, FormControlLabel, Snackbar, Alert, useMediaQuery
} from '@mui/material';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:3001/cart')
      .then(res => setCartItems(res.data))
      .catch(err => console.error('Error fetching cart items:', err));
  }, []);

  const getTotal = () => cartItems.reduce((sum, i) => sum + i.price * (i.quantity || 1), 0);
  const getDiscount = () => Math.floor(getTotal() * 0.04);
  const platformFee = 4;
  const finalAmount = getTotal() - getDiscount() + platformFee;

  const handlePlaceOrder = async () => {
    if (!paymentMethod) return alert('Select a payment method.');

    try {
      await axios.post('http://localhost:3001/checkorder', {
        items: cartItems,
        paymentMethod,
        total: finalAmount,
        createdAt: new Date().toISOString()
      });

      await Promise.all(cartItems.map(i => axios.delete(`http://localhost:3001/cart/${i.id}`)));

      setSnackbarOpen(true);

      // Redirect to home after showing success
      setTimeout(() => {
        navigate('/');
      }, 2500);
    } catch (err) {
      alert('Order failed.');
    }
  };

  return (
    <Box sx={{ p: 2, background: 'linear-gradient(to bottom, #e6f7ff, #ccf2ff)', minHeight: '100vh' }}>
      {/* Cart Items List */}
      <Paper sx={{ p: 2, mb: 2 }}>
        {cartItems.map(item => (
          <Box
            key={item.id}
            display="flex"
            flexDirection={isMobile ? 'row' : 'row'}
            alignItems={isMobile ? 'flex-start' : 'center'}
            mb={2}
          >
            <Avatar
              src={item.image}
              variant="square"
              sx={{ width: 56, height: 56, mr: isMobile ? 0 : 2, mb: isMobile ? 1 : 0 }}
            />
            <Box flex={1} mb={isMobile ? 1 : 0}>
              <Typography fontWeight="bold">{item.brand || item.company} - {item.model}</Typography>
              <Typography variant="body2">₹{item.price.toLocaleString('en-IN')} x {item.quantity || 1}</Typography>
            </Box>
            <Typography fontWeight="bold">₹{(item.price * (item.quantity || 1)).toLocaleString('en-IN')}</Typography>
          </Box>
        ))}
      </Paper>

      {/* Price Details */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>PRICE DETAILS</Typography>
        <Divider sx={{ mb: 2 }} />
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography>Price ({cartItems.length} items)</Typography>
          <Typography>₹{getTotal().toLocaleString('en-IN')}</Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography>Discount</Typography>
          <Typography sx={{ color: 'green' }}>- ₹{getDiscount().toLocaleString('en-IN')}</Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography>Platform Fee</Typography>
          <Typography>₹{platformFee}</Typography>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography fontWeight="bold">Total Amount</Typography>
          <Typography fontWeight="bold">₹{finalAmount.toLocaleString('en-IN')}</Typography>
        </Box>
        <Typography color="green">
          You will save ₹{getDiscount().toLocaleString('en-IN')} on this order
        </Typography>
      </Paper>

      {/* Payment Method */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>PAYMENT METHOD</Typography>
        <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
          <FormControlLabel value="cod" control={<Radio />} label="Cash on Delivery" />
          <FormControlLabel value="gpay" control={<Radio />} label="Google Pay (UPI)" />
          <FormControlLabel value="phonepe" control={<Radio />} label="PhonePe (UPI)" />
        </RadioGroup>
      </Paper>

      {/* Buttons */}
      <Button variant="contained" fullWidth sx={{ mb: 1 }} onClick={handlePlaceOrder}>
        PLACE ORDER
      </Button>
      <Button fullWidth onClick={() => navigate('/')}>
        CONTINUE SHOPPING
      </Button>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2500}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled">
          Order placed successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Checkout;
