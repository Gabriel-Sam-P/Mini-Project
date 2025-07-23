import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  AppBar, Toolbar, Box, IconButton, Drawer, Typography, Badge,
  Avatar, Menu, MenuItem, useMediaQuery, useTheme, InputBase,
  Tooltip, Select, FormControl, MenuItem as MuiMenuItem
} from '@mui/material';
import {
  MenuSharp as MenuIcon, Favorite, ShoppingCart,
  AccountCircle, Close
} from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import { CartWishlistContext } from '../pages/WishlistContext';
import DefaultAvatar from '../Assets/F2.jpg';

const CombinedNavbar = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { cartCount, wishlistCount, fetchCartCount, fetchWishlistCount } = useContext(CartWishlistContext);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerAccountOpen, setDrawerAccountOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    const updateLoginStatus = () => {
      const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
      const avatar = localStorage.getItem('avatar');
      setLoggedIn(isLoggedIn);
      setAvatarUrl(avatar || null);
    };

    updateLoginStatus();
    window.addEventListener('storage', updateLoginStatus);
    window.addEventListener('updateCounts', () => {
      fetchCartCount();
      fetchWishlistCount();
    });

    return () => {
      window.removeEventListener('storage', updateLoginStatus);
      window.removeEventListener('updateCounts', fetchCartCount);
    };
  }, [fetchCartCount, fetchWishlistCount]);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      const query = `?q=${encodeURIComponent(searchTerm.trim())}${categoryFilter ? `&category=${categoryFilter}` : ''}`;
      navigate(`/search${query}`);
      setSearchTerm('');
      setShowMobileSearch(false);
    }
  };

  const drawerList = (
    <Box sx={{ width: 250, bgcolor: '#121B2B', color: '#fff', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>Menu</Typography>
        <IconButton sx={{ color: '#fff' }} onClick={() => setDrawerOpen(false)}><Close /></IconButton>
      </Box>
      <MenuItem onClick={() => { navigate('/'); setDrawerOpen(false); }}>Home</MenuItem>
      <MenuItem onClick={() => { navigate(loggedIn ? '/Wishlist' : '/Login'); setDrawerOpen(false); }}>Wishlist</MenuItem>
      <MenuItem onClick={() => { navigate(loggedIn ? '/Cart' : '/Login'); setDrawerOpen(false); }}>Cart</MenuItem>
    </Box>
  );

  const accountDrawerList = (
    <Box sx={{ width: 250, bgcolor: '#121B2B', color: '#fff', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>{loggedIn ? 'Account' : 'Welcome'}</Typography>
        <IconButton sx={{ color: '#fff' }} onClick={() => setDrawerAccountOpen(false)}><Close /></IconButton>
      </Box>
      {loggedIn ? (
        <>
          <MenuItem onClick={() => { navigate('/Profile'); setDrawerAccountOpen(false); }}>Profile</MenuItem>
          <MenuItem onClick={() => {
            localStorage.clear();
            setLoggedIn(false);
            setDrawerAccountOpen(false);
            navigate('/');
            window.dispatchEvent(new Event('storage'));
          }}>Logout</MenuItem>
        </>
      ) : (
        <>
          <MenuItem onClick={() => { navigate('/Login'); setDrawerAccountOpen(false); }}>Login</MenuItem>
          <MenuItem onClick={() => { navigate('/Signup'); setDrawerAccountOpen(false); }}>Signup</MenuItem>
        </>
      )}
    </Box>
  );

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <>
      {/* Sticky AppBar */}
      <AppBar position="fixed" sx={{height: {lg:'120px',md:'100px',sm:'80px',xs:'80px'},background: 'linear-gradient(to bottom, #000066 0%, #0000cc 100%)' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', color: 'white' }}>
              <Typography variant="body2" sx={{ fontFamily: 'Rubik Gemstones, system-ui', fontSize:{lg:60,md:40,sm:30,xs:30} }}>E-Cart</Typography>
              <Typography variant="subtitle1" sx={{ fontStyle: 'italic', marginTop: '-4px' }}>Online Shopping</Typography>
            </Box>
          </Link>

          {!isMobile && (
            <Box sx={{display: 'flex', alignItems: 'center', gap: 1, border: '1px solid #00FFFF', borderRadius: '8px', bgcolor: '#fff', px: 1, py: 0.5, width: { lg: 400, md: 300 } }}>
              <InputBase
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                sx={{ flex: 1, fontSize: 14, pl: 1, pr: 1 }}
              />
              <FormControl size="small" sx={{ minWidth: 100, '& .MuiOutlinedInput-root': { height: 36, fontSize: 14 } }}>
                <Select
                  displayEmpty
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  inputProps={{ 'aria-label': 'Select category' }}
                >
                  <MuiMenuItem value="">All</MuiMenuItem>
                  <MuiMenuItem value="mobile">Mobile</MuiMenuItem>
                  <MuiMenuItem value="tv">TV</MuiMenuItem>
                  <MuiMenuItem value="ac">AC</MuiMenuItem>
                  <MuiMenuItem value="computer">Computer</MuiMenuItem>
                  <MuiMenuItem value="fridge">Fridge</MuiMenuItem>
                  <MuiMenuItem value="watch">Watch</MuiMenuItem>
                </Select>
              </FormControl>
              <IconButton onClick={handleSearch} sx={{ color: '#000' }}><SearchIcon /></IconButton>
            </Box>
          )}

          {isMobile ? (
            <Box>
              <IconButton color="inherit" onClick={() => setShowMobileSearch(true)}><SearchIcon /></IconButton>
              <IconButton color="inherit" onClick={() => setDrawerOpen(true)}><MenuIcon /></IconButton>
              <IconButton color="inherit" onClick={() => setDrawerAccountOpen(true)}>
                {loggedIn ? <Avatar src={avatarUrl || DefaultAvatar} /> : <AccountCircle />}
              </IconButton>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Tooltip title="Wishlist">
                <IconButton color="inherit" onClick={() => navigate(loggedIn ? '/wishlist' : '/login')}>
                  <Badge badgeContent={wishlistCount} color="secondary"><Favorite /></Badge>
                </IconButton>
              </Tooltip>
              <Tooltip title="Cart">
                <IconButton color="inherit" onClick={() => navigate(loggedIn ? '/cart' : '/login')}>
                  <Badge badgeContent={cartCount} color="secondary"><ShoppingCart /></Badge>
                </IconButton>
              </Tooltip>
              <Tooltip title={loggedIn ? 'Account' : 'Login / Signup'}>
                <IconButton color="inherit" onClick={handleMenuClick}>
                  {loggedIn ? <Avatar src={avatarUrl || DefaultAvatar} /> : <AccountCircle />}
                </IconButton>
              </Tooltip>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                {loggedIn ? (
                  <>
                    <MenuItem onClick={() => { navigate('/Profile'); handleMenuClose(); }}>Profile</MenuItem>
                    <MenuItem onClick={() => {
                      localStorage.clear();
                      setLoggedIn(false);
                      handleMenuClose();
                      navigate('/');
                      window.dispatchEvent(new Event('storage'));
                    }}>Logout</MenuItem>
                  </>
                ) : (
                  <>
                    <MenuItem onClick={() => { navigate('/Login'); handleMenuClose(); }}>Login</MenuItem>
                    <MenuItem onClick={() => { navigate('/Signup'); handleMenuClose(); }}>Signup</MenuItem>
                  </>
                )}
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Spacer below fixed navbar */}
      <Box sx={{ height:{lg:'120px',md:'100px',sm:'80px',xs:'80px'} }} />

      {/* Mobile Search UI */}
      {showMobileSearch && isMobile && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bgcolor: '#f5f5f5',
            zIndex: 1300,
            p: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: '#ffffff',
              borderRadius: '8px',
              flex: 1,
              border: '1px solid #ccc',
              px: 1,
              py: 0.5,
            }}
          >
            <InputBase
              autoFocus
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              sx={{ flex: 1, color: '#000' }}
            />
            <FormControl
              size="small"
              sx={{
                minWidth: 90,
                bgcolor: '#ffffff',
                '& .MuiOutlinedInput-root': {
                  color: 'black',
                  height: 35,
                  borderRadius: 1,
                },
                '& .MuiSvgIcon-root': {
                  color: '#000',
                },
              }}
            >
              <Select
                displayEmpty
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                inputProps={{ 'aria-label': 'Category' }}
              >
                <MuiMenuItem value="">All</MuiMenuItem>
                <MuiMenuItem value="mobile">Mobile</MuiMenuItem>
                <MuiMenuItem value="tv">TV</MuiMenuItem>
                <MuiMenuItem value="ac">AC</MuiMenuItem>
                <MuiMenuItem value="computer">Computer</MuiMenuItem>
                <MuiMenuItem value="fridge">Fridge</MuiMenuItem>
                <MuiMenuItem value="watch">Watch</MuiMenuItem>
              </Select>
            </FormControl>
          </Box>
          <IconButton sx={{ color: '#000' }} onClick={handleSearch}><SearchIcon /></IconButton>
          <IconButton sx={{ color: '#000' }} onClick={() => setShowMobileSearch(false)}><Close /></IconButton>
        </Box>
      )}

      {/* Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen || drawerAccountOpen}
        onClose={() => {
          setDrawerOpen(false);
          setDrawerAccountOpen(false);
        }}
      >
        {drawerAccountOpen ? accountDrawerList : drawerList}
      </Drawer>
    </>
  );
};

export default CombinedNavbar;
