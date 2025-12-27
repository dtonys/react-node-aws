import { AppBar, Box, Toolbar, Button, IconButton, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';
import { pushState } from 'client/helpers/routing';
import rnaLogo from 'client/images/RNA-white-2.png';
import fetchClient from 'client/helpers/fetchClient';
import { useSessionHistory } from 'client/components/SessionHistoryContext';

// Mobile breakpoint: below 'md' (900px) shows hamburger menu
const MOBILE_BREAKPOINT = 'md';

type NavProps = {
  userEmail: string;
  isEmailVerified: boolean;
  loadCookieSession: () => Promise<void>;
};

const Nav = ({ userEmail, isEmailVerified, loadCookieSession }: NavProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const { clearHistory } = useSessionHistory();

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    setIsLoading(true);
    handleMenuClose();
    await clearHistory();
    await fetchClient.post('/api/auth/logout');
    await loadCookieSession();
    pushState('/login');
  };

  const handleNavigate = (path: string) => {
    handleMenuClose();
    pushState(path);
  };

  return (
    <AppBar position="static" className="navbar">
      <Toolbar>
        <Box
          component="img"
          src={rnaLogo}
          alt="Logo"
          onClick={() => pushState('/')}
          sx={{ height: 50, mr: 2, cursor: 'pointer' }}
        />
        <Box sx={{ flexGrow: 1 }} />

        {/* Desktop Navigation */}
        <Box sx={{ display: { xs: 'none', [MOBILE_BREAKPOINT]: 'flex' }, gap: 1 }}>
          <Button
            color="inherit"
            variant="outlined"
            sx={{ backgroundColor: 'white', color: 'black' }}
            onClick={() => pushState('/styleguide')}
          >
            Styleguide
          </Button>
          {isEmailVerified && (
            <>
              <Button
                color="inherit"
                variant="outlined"
                sx={{ backgroundColor: 'white', color: 'black' }}
                onClick={() => pushState('/data-grid')}
              >
                Data Grid
              </Button>
              <Button
                color="inherit"
                variant="outlined"
                sx={{ backgroundColor: 'white', color: 'black' }}
                onClick={() => pushState('/history')}
              >
                History
              </Button>
              <Button
                color="inherit"
                variant="outlined"
                sx={{ backgroundColor: 'white', color: 'black' }}
                onClick={() => pushState('/search')}
              >
                Search
              </Button>
              <Button
                color="inherit"
                variant="outlined"
                sx={{ backgroundColor: 'white', color: 'black' }}
                onClick={() => pushState('/uploads')}
              >
                Uploads
              </Button>
            </>
          )}
          <Button
            color="inherit"
            variant="outlined"
            sx={{ backgroundColor: 'white', color: 'black' }}
            onClick={handleLogout}
            disabled={isLoading}
          >
            {isLoading ? 'Logging out...' : 'Logout'}
          </Button>
        </Box>

        {/* Mobile Navigation */}
        <Box sx={{ display: { xs: 'flex', [MOBILE_BREAKPOINT]: 'none' } }}>
          <IconButton
            size="large"
            edge="end"
            color="inherit"
            aria-label="menu"
            aria-controls={menuOpen ? 'nav-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={menuOpen ? 'true' : undefined}
            onClick={handleMenuOpen}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="nav-menu"
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={() => handleNavigate('/styleguide')}>Styleguide</MenuItem>
            {isEmailVerified && (
              <MenuItem onClick={() => handleNavigate('/data-grid')}>Data Grid</MenuItem>
            )}
            {isEmailVerified && (
              <MenuItem onClick={() => handleNavigate('/history')}>History</MenuItem>
            )}
            {isEmailVerified && (
              <MenuItem onClick={() => handleNavigate('/search')}>Search</MenuItem>
            )}
            {isEmailVerified && (
              <MenuItem onClick={() => handleNavigate('/uploads')}>Uploads</MenuItem>
            )}
            <MenuItem onClick={handleLogout} disabled={isLoading}>
              {isLoading ? 'Logging out...' : 'Logout'}
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Nav;
