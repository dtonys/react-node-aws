import { AppBar, Box, Toolbar, Typography, Button } from '@mui/material';
import { useState } from 'react';
import { replaceState } from 'client/helpers/routing';
import rnaLogo from 'client/images/RNA-white-2.png';
import fetchClient from 'client/helpers/fetchClient';

type NavProps = {
  userEmail: string;
  loadCookieSession: () => Promise<void>;
};

const Nav = ({ userEmail, loadCookieSession }: NavProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    await fetchClient.post('/api/auth/logout');
    await loadCookieSession();
    replaceState('/login');
  };

  return (
    <AppBar position="static" className="navbar">
      <Toolbar>
        <Box
          component="img"
          src={rnaLogo}
          alt="Logo"
          onClick={() => replaceState('/')}
          sx={{ height: 50, mr: 2, cursor: 'pointer' }}
        />
        <Box sx={{ flexGrow: 1 }} />
        <Button
          color="inherit"
          variant="outlined"
          sx={{ backgroundColor: 'white', color: 'black', mr: 1 }}
          onClick={() => replaceState('/styleguide')}
        >
          Styleguide
        </Button>
        <Button
          color="inherit"
          variant="outlined"
          sx={{ backgroundColor: 'white', color: 'black', mr: 1 }}
          onClick={() => replaceState('/uploads')}
        >
          Uploads
        </Button>
        <Button
          color="inherit"
          variant="outlined"
          sx={{ backgroundColor: 'white', color: 'black' }}
          onClick={handleLogout}
          disabled={isLoading}
        >
          {isLoading ? 'Logging out...' : 'Logout'}
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Nav;
