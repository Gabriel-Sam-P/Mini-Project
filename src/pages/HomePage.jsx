import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Card, CardMedia, Typography, CardActions, Button } from '@mui/material';

const HomePage = () => {
  const [categories, setCategories] = useState({
    mobiles: [], acs: [], computers: [], fridges: [], tvs: [], watches: [],
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseURL = 'https://e-cart-by-gabriel-default-rtdb.firebaseio.com';

        const [mobiles, acs, computers, fridges, tvs, watches] = await Promise.all([
          axios.get(`${baseURL}/mobileData.json`),
          axios.get(`${baseURL}/acData.json`),
          axios.get(`${baseURL}/computerData.json`),
          axios.get(`${baseURL}/fridgeData.json`),
          axios.get(`${baseURL}/tvData.json`),
          axios.get(`${baseURL}/watchData.json`),
        ]);

        setCategories({
          mobiles: mobiles.data || [],
          acs: acs.data || [],
          computers: computers.data || [],
          fridges: fridges.data || [],
          tvs: tvs.data || [],
          watches: watches.data || [],
        });
      } catch (error) {
        console.error('Error fetching product data from Firebase:', error);
      }
    };

    fetchData();
  }, []);

  const productList = [
    { key: 'mobiles', label: 'Mobiles' }, { key: 'acs', label: "AC's" },
    { key: 'computers', label: 'Computers' }, { key: 'fridges', label: 'Fridges' },
    { key: 'tvs', label: "TV's" }, { key: 'watches', label: 'Watches' },
  ];

  const renderCard = ({ key, label }) => {
    const product = categories[key]?.[0];
    if (!product) return null;

    return (
      <Grid item xs={12} sm={6} md={3} lg={3} key={key}>
        <div className="animate__animated animate__fadeInDown">
          <Card sx={{ maxWidth: 345, mx: 'auto', p: 1 }}>
            <CardMedia
              component="img"
              image={product.image}
              alt={product.model || label}
              sx={{ height: 210, objectFit: 'contain' }}
            />
            <Typography variant="h6" align="center" sx={{ fontWeight: 600 }}>
              {label}
            </Typography>
            <CardActions sx={{ justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => navigate(`/products/${key}`)}
              >
                Show More
              </Button>
            </CardActions>
          </Card>
        </div>
      </Grid>
    );
  };

  return (
    <Box sx={{ flexGrow: 1, p: 4, background: "linear-gradient(to bottom, #00ff99 0%, #3366cc 100%)" }}>
      <Grid container spacing={4} justifyContent="center">
        {productList.map(renderCard)}
      </Grid>
    </Box>
  );
};

export default HomePage;
