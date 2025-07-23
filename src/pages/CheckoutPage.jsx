import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Divider, Avatar, Button,
  Radio, RadioGroup, FormControlLabel, Snackbar, Alert, useMediaQuery
} from '@mui/material';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const FIREBASE_URL = 'https://e-cart-by-gabriel-default-rtdb.firebaseio.com';

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const username = localStorage.getItem('username');

  useEffect(() => {
    if (!username) {
      navigate('/login');
      return;
    }

    axios.get(`${FIREBASE_URL}/cart.json`)
      .then(res => {
        const data = res.data || {};
        const formattedItems = Object.entries(data)
          .filter(([key, value]) => value.username === username)
          .map(([key, value]) => ({
            firebaseId: key,
            ...value
          }));
        setCartItems(formattedItems);
      })
      .catch(err => console.error('Error fetching cart items:', err));
  }, [username, navigate]);

  const getTotal = () => cartItems.reduce((sum, i) => sum + i.price * (i.quantity || 1), 0);
  const getDiscount = () => Math.floor(getTotal() * 0.04);
  const platformFee = 4;
  const finalAmount = getTotal() - getDiscount() + platformFee;

  const handlePlaceOrder = async () => {
    if (!paymentMethod) {
      alert('Select a payment method.');
      return;
    }

    try {
      await axios.post(`${FIREBASE_URL}/checkorder.json`, {
        username,
        items: cartItems,
        paymentMethod,
        total: finalAmount,
        createdAt: new Date().toISOString()
      });

      const deleteRequests = cartItems.map(item =>
        axios.delete(`${FIREBASE_URL}/cart/${item.firebaseId}.json`)
      );
      await Promise.all(deleteRequests);

      setSnackbarOpen(true);
      setTimeout(() => navigate('/'), 2500);
    } catch (err) {
      console.error('Order failed:', err);
      alert('Order failed.');
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        background: "linear-gradient(to bottom, #00ff99 0%, #3366cc 100%)",
        minHeight: '100vh',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'center',
          alignItems: { xs: 'center', md: 'flex-start' },
          maxWidth: '1200px',
          mx: 'auto',
          gap: { xs: 2, md: 4 },
        }}
      >
        {/* Left Section */}
        <Box
          flex={1}
          sx={{
            maxWidth: { xs: '100%', md: '420px', lg: '720px' },
            width: '100%',
          }}
        >
          <Paper sx={{ p: 2, mb: 2 }}>
            {cartItems.map(item => (
              <Box
                key={item.firebaseId}
                display="flex"
                alignItems="center"
                mb={2}
              >
                <Avatar src={item.image} variant="square" sx={{ width: 56, height: 56, mr: 2 }} />
                <Box flex={1}>
                  <Typography fontWeight="bold">{item.brand || item.company} - {item.model}</Typography>
                  <Typography variant="body2">₹{item.price.toLocaleString('en-IN')} x {item.quantity || 1}</Typography>
                </Box>
                <Typography fontWeight="bold">₹{(item.price * (item.quantity || 1)).toLocaleString('en-IN')}</Typography>
              </Box>
            ))}
          </Paper>

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
        </Box>

        {/* Right Section */}
        <Box
          flex={1}
          sx={{
            maxWidth: { xs: '100%', sm: '350px', md: '250px', lg: '300px' },
            width: '100%',
            mx: { xs: 'auto', sm: 'auto', md: 0 },
            textAlign:'center'
          }}
        >
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>PAYMENT METHOD</Typography>
            <RadioGroup
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              sx={{
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <FormControlLabel value="cod" control={<Radio />} label="Cash on Delivery" />
              <FormControlLabel value="UPI" control={<Radio />} label="UPI" />
            </RadioGroup>
          </Paper>

          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                onClick={handlePlaceOrder}
                sx={{ width: 180 }}
              >
                PLACE ORDER
              </Button>
            </Box>

            <Button onClick={() => navigate('/')} fullWidth>
              CONTINUE SHOPPING
            </Button>
          </Paper>
        </Box>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2500}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled">Order placed successfully!</Alert>
      </Snackbar>
    </Box>
  );
};

export default Checkout;
