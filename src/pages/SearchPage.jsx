import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Grid, Typography, Box, CircularProgress, Card,
  CardMedia, CardContent, IconButton, Snackbar, Alert
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

const endpoints = [
  'http://localhost:3001/mobileData',
  'http://localhost:3001/acData',
  'http://localhost:3001/computerData',
  'http://localhost:3001/fridgeData',
  'http://localhost:3001/tvData',
  'http://localhost:3001/watchData',
];

const SearchPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';

  const query = queryParam.trim().toLowerCase();
  const category = categoryParam.trim().toLowerCase();

  const [allProducts, setAllProducts] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Load user and wishlist
  useEffect(() => {
    const loadUser = async () => {
      const username = localStorage.getItem('username');
      if (!username) return;

      try {
        const { data: wishlist } = await axios.get('http://localhost:3001/wishlist');
        const filtered = wishlist.filter(item => item.username === username);
        setWishlistItems(filtered);
        setCurrentUser({ username });
      } catch (error) {
        console.error('Failed to load wishlist:', error);
      }
    };

    loadUser();
  }, []);

  // Fetch products on search
  useEffect(() => {
    const fetchProducts = async () => {
      if (!query) {
        setAllProducts([]);
        setLoading(false);
        return;
      }

      try {
        const responses = await Promise.all(endpoints.map(url => axios.get(url)));
        const combined = responses.flatMap(res => res.data);

        const filtered = combined.filter(item => {
          const model = item.model?.toLowerCase() || '';
          const company = item.company?.toLowerCase() || '';
          const description = item.description?.toLowerCase() || '';
          const productType = item.product?.toLowerCase() || '';

          const matchesQuery = model.includes(query) || company.includes(query) || description.includes(query);
          const matchesCategory = category ? productType === category : true;

          return matchesQuery && matchesCategory;
        });

        setAllProducts(filtered);
      } catch (err) {
        console.error('Error fetching product data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [query, category]);

  // Check if product is in wishlist
  const isInWishlist = (item) =>
    wishlistItems.some(w => w.model === item.model && w.username === currentUser?.username);

  // Add to cart
  const handleAddToCart = async (item) => {
    if (!currentUser) {
      setSnackbar({ open: true, message: 'Please log in to add items to cart.', severity: 'warning' });
      return;
    }

    try {
      const cartItem = { ...item, username: currentUser.username, quantity: 1 };
      await axios.post('http://localhost:3001/cart', cartItem);
      setSnackbar({ open: true, message: 'Item added to cart!', severity: 'success' });
      window.dispatchEvent(new Event('updateCounts'));
    } catch (err) {
      console.error('Add to cart failed:', err);
      setSnackbar({ open: true, message: 'Failed to add to cart.', severity: 'error' });
    }
  };

  // Toggle wishlist
  const toggleWishlist = async (item) => {
    if (!currentUser) {
      setSnackbar({ open: true, message: 'Please log in to manage wishlist.', severity: 'warning' });
      return;
    }

    try {
      const exists = isInWishlist(item);
      if (exists) {
        const { data: wishlist } = await axios.get('http://localhost:3001/wishlist');
        const match = wishlist.find(w => w.model === item.model && w.username === currentUser.username);
        if (match) {
          await axios.delete(`http://localhost:3001/wishlist/${match.id}`);
          setWishlistItems(prev => prev.filter(w => w.id !== match.id));
          setSnackbar({ open: true, message: 'Removed from wishlist.', severity: 'info' });
        }
      } else {
        const newItem = { ...item, username: currentUser.username };
        const { data } = await axios.post('http://localhost:3001/wishlist', newItem);
        setWishlistItems(prev => [...prev, data]);
        setSnackbar({ open: true, message: 'Added to wishlist!', severity: 'success' });
      }
      window.dispatchEvent(new Event('updateCounts'));
    } catch (error) {
      console.error('Wishlist toggle error:', error);
      setSnackbar({ open: true, message: 'Failed to update wishlist.', severity: 'error' });
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 4 },background:"linear-gradient(to top, #00ff99 0%, #3366cc 100%)"}}  >
      <Typography variant="h4" gutterBottom>
        Search Results for "{queryParam}" {category && `(Category: ${category})`}
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : allProducts.length === 0 ? (
        <Typography variant="h6" sx={{ mt: 4 }}>No matching products found.</Typography>
      ) : (
        <Grid container spacing={3}>
          {allProducts.map((item, idx) => {
            const favorite = isInWishlist(item);
            return (
              <Grid size ={{xs:12,sm:6,md:4,lg:3}}  className='animate__animated animate__backInDown' key={idx}>
                <Card sx={{ maxWidth: 245, mx: 'auto',borderRadius:'10px' }}>
                  <CardMedia
                    component="img"
                    image={item.image || '/assets/fallback.jpg'}
                    alt={item.model}
                    onError={(e) => { e.target.src = '/assets/fallback.jpg'; }}
                    sx={{height:200, objectFit: 'contain', mt:2 }}
                  />
                  <CardContent 
                          sx={{
                              justifyContent: 'center',
                              flexDirection: 'column',
                              color: 'black',
                              background: 'linear-gradient(to bottom, #ffffcc 0%, #00ffff 100%)',
                            }}
                  >
                    <Typography variant="h6">{item.company}</Typography>
                    <Typography variant="body2">{item.model}</Typography>
                    <Typography variant="body1" color="primary">₹{item.price}</Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <IconButton onClick={() => handleAddToCart(item)} color="primary">
                        <AddShoppingCartIcon />
                      </IconButton>
                      <IconButton onClick={() => toggleWishlist(item)} color="error">
                        {favorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default SearchPage;
