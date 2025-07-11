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
import 'animate.css';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { CartWishlistContext } from './WishlistContext';

const apiEndpoints = {
  mobiles: 'http://localhost:3001/mobileData',
  acs: 'http://localhost:3001/acData',
  computers: 'http://localhost:3001/computerData',
  fridges: 'http://localhost:3001/fridgeData',
  tvs: 'http://localhost:3001/tvData',
  watches: 'http://localhost:3001/watchData',
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
      try {
        const [productRes, wishlistRes] = await Promise.all([
          axios.get(apiEndpoints[category]),
          axios.get('http://localhost:3001/wishlist'),
        ]);

        setProducts(productRes.data);

        if (username) {
          const userWishlist = wishlistRes.data.filter(item => item.username === username);
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
    return wishlistItems.some(
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
      const { data: wishlistData } = await axios.get('http://localhost:3001/wishlist');

      const existing = wishlistData.find(
        item => item.model === product.model &&
                item.company === product.company &&
                item.username === username
      );

      if (existing) {
        await axios.delete(`http://localhost:3001/wishlist/${existing.id}`);
        setWishlistItems(prev => prev.filter(item => item.id !== existing.id));
        setSnackbar({ open: true, message: 'Removed from wishlist', severity: 'info' });
      } else {
        const newItem = { ...product, username };
        const { data: addedItem } = await axios.post('http://localhost:3001/wishlist', newItem);
        setWishlistItems(prev => [...prev, addedItem]);
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
      const { data: cartItems } = await axios.get('http://localhost:3001/cart');
      const alreadyInCart = cartItems.some(
        item => item.model === product.model &&
                item.company === product.company &&
                item.username === username
      );

      if (alreadyInCart) {
        setSnackbar({ open: true, message: 'Item already in cart.', severity: 'info' });
        return;
      }

      await axios.post('http://localhost:3001/cart', {
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
    <Box sx={{ flexGrow: 1, p: 8 ,background: 'linear-gradient(to bottom, #3399ff 0%, #6600cc 100%)'}}>
      <Typography variant="h4" align="center" sx={{ mb: 4, textTransform: 'capitalize' }}>
        {category}
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={6} justifyContent="center">
          {products.map((product, index) => (
            <Grid size ={{xs:12,sm:6,md:4,lg:3}} key={index}>
              <div className='animate__animated animate__backInDown'>
                  <Card sx={{ maxWidth: 245, mx: 'auto',borderRadius:'10px' }}>
                    <CardMedia
                      component="img"
                      image={product.image || '/assets/fallback.jpg'}
                      alt={product.model}
                      onError={(e) => { e.target.src = '/assets/fallback.jpg'; }}
                      sx={{ height: 200, objectFit: 'contain', mt: 2 }}
                    />
                    <Typography variant="h6" align="center">
                      {product.company}
                    </Typography>
    
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
                              ₹{product.price.toLocaleString('en-IN')}
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
