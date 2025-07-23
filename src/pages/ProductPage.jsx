import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardMedia,
  Typography,
  CardActions,
  Button,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { CartWishlistContext } from './WishlistContext';
import 'animate.css';

const apiEndpoints = {
  mobiles: 'https://e-cart-by-gabriel-default-rtdb.firebaseio.com/mobileData.json',
  acs: 'https://e-cart-by-gabriel-default-rtdb.firebaseio.com/acData.json',
  computers: 'https://e-cart-by-gabriel-default-rtdb.firebaseio.com/computerData.json',
  fridges: 'https://e-cart-by-gabriel-default-rtdb.firebaseio.com/fridgeData.json',
  tvs: 'https://e-cart-by-gabriel-default-rtdb.firebaseio.com/tvData.json',
  watches: 'https://e-cart-by-gabriel-default-rtdb.firebaseio.com/watchData.json',
};

const categoryLabels = {
  mobiles: "Mobiles",
  acs: "Air Conditioners",
  computers: "Laptops",
  fridges: "Refrigerators",
  tvs: "Televisions",
  watches: "Watches",
};

const ProductPage = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const { fetchWishlistCount, fetchCartCount } = useContext(CartWishlistContext);

  useEffect(() => {
    const username = localStorage.getItem('username');

    const fetchData = async () => {
      setLoading(true);
      try {
        const [productRes, wishlistRes] = await Promise.all([
          axios.get(apiEndpoints[category]),
          axios.get('https://e-cart-by-gabriel-default-rtdb.firebaseio.com/wishlist.json'),
        ]);

        const productArray = productRes.data ? Object.values(productRes.data) : [];
        setProducts(productArray);

        if (username) {
          const wishlistArray = wishlistRes.data
            ? Object.entries(wishlistRes.data).map(([key, val]) => ({ firebaseKey: key, ...val }))
            : [];

          const userWishlist = wishlistArray.filter(item => item.username === username);
          setWishlistItems(userWishlist);
        }
      } catch (error) {
        console.error('Error loading product data:', error);
        setSnackbar({ open: true, message: 'Failed to load products.', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [category]);

  const isInWishlist = (product) => {
    return wishlistItems?.some(
      item => item.model === product.model && item.company === product.company
    );
  };

  const handleWishlistClick = async (product) => {
    const username = localStorage.getItem('username');
    if (!username) {
      setSnackbar({ open: true, message: 'Please log in to use wishlist.', severity: 'warning' });
      return;
    }

    try {
      const wishlistRes = await axios.get('https://e-cart-by-gabriel-default-rtdb.firebaseio.com/wishlist.json');
      const wishlistArray = wishlistRes.data
        ? Object.entries(wishlistRes.data).map(([key, val]) => ({ firebaseKey: key, ...val }))
        : [];

      const existing = wishlistArray.find(
        item => item.model === product.model &&
          item.company === product.company &&
          item.username === username
      );

      if (existing) {
        await axios.delete(`https://e-cart-by-gabriel-default-rtdb.firebaseio.com/wishlist/${existing.firebaseKey}.json`);
        setWishlistItems(prev => prev.filter(item => item.firebaseKey !== existing.firebaseKey));
        setSnackbar({ open: true, message: 'Removed from wishlist', severity: 'info' });
      } else {
        const newItem = { ...product, username };
        const response = await axios.post(`https://e-cart-by-gabriel-default-rtdb.firebaseio.com/wishlist.json`, newItem);
        setWishlistItems(prev => [...prev, { ...newItem, firebaseKey: response.data.name }]);
        setSnackbar({ open: true, message: 'Added to wishlist', severity: 'success' });
      }

      fetchWishlistCount();
      window.dispatchEvent(new Event('updateCounts'));
    } catch (err) {
      console.error('Wishlist update failed:', err);
      setSnackbar({ open: true, message: 'Error updating wishlist.', severity: 'error' });
    }
  };

  const handleAddToCart = async (product) => {
    const username = localStorage.getItem('username');
    if (!username) {
      setSnackbar({ open: true, message: 'Please log in to add to cart.', severity: 'warning' });
      return;
    }

    try {
      const cartRes = await axios.get('https://e-cart-by-gabriel-default-rtdb.firebaseio.com/cart.json');
      const cartArray = cartRes.data
        ? Object.entries(cartRes.data).map(([key, val]) => ({ firebaseKey: key, ...val }))
        : [];

      const alreadyInCart = cartArray.some(
        item => item.model === product.model &&
          item.company === product.company &&
          item.username === username
      );

      if (alreadyInCart) {
        setSnackbar({ open: true, message: 'Item already in cart.', severity: 'info' });
        return;
      }

      await axios.post(`https://e-cart-by-gabriel-default-rtdb.firebaseio.com/cart.json`, {
        ...product,
        username,
        quantity: 1
      });

      setSnackbar({ open: true, message: 'Added to cart', severity: 'success' });
      fetchCartCount();
      window.dispatchEvent(new Event('updateCounts'));
    } catch (err) {
      console.error('Add to cart failed:', err);
      setSnackbar({ open: true, message: 'Failed to add to cart.', severity: 'error' });
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 8, background: "linear-gradient(to bottom, #00ff99 0%, #3366cc 100%)" }}>
      <Typography variant="h4" align="center" sx={{ mb: 4 }}>
        {categoryLabels[category] || category}
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={6} justifyContent="center">
          {products.map((product, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <div className="animate__animated animate__backInDown">
                <Card sx={{ maxWidth: 245, mx: 'auto', borderRadius: '10px' }}>
                  <CardMedia
                    component="img"
                    image={product.image || '/assets/fallback.jpg'}
                    alt={product.model}
                    onError={(e) => { e.target.src = '/assets/fallback.jpg'; }}
                    sx={{ height: 200, objectFit: 'contain', mt: 2 }}
                  />
                  <Typography variant="h6" align="center">{product.company}</Typography>

                  <CardActions
                    sx={{
                      justifyContent: 'center',
                      flexDirection: 'column',
                      color: 'white',
                      background: 'linear-gradient(to bottom, #000066 0%, #66ccff 100%)',
                    }}
                  >
                    <Typography variant="body2" align="center" sx={{ mb: 1, height: 60 }}>
                      {product.description}
                    </Typography>
                    <Typography variant="h6" align="center" color="white">
                      ₹{product.price?.toLocaleString('en-IN')}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1 }}>
                      <Button
                        variant="outlined"
                        sx={{ color: 'white', backgroundColor: 'blue' }}
                        onClick={() => handleAddToCart(product)}
                      >
                        Add to Cart
                      </Button>
                      <IconButton onClick={() => handleWishlistClick(product)}>
                        <FavoriteIcon
                          sx={{
                            fontSize: 28,
                            color: isInWishlist(product) ? 'red' : '#404040',
                          }}
                        />
                      </IconButton>
                    </Box>
                  </CardActions>
                </Card>
              </div>
            </Grid>
          ))}
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

export default ProductPage;
