import { AppBar, Box, Toolbar, Typography, Button } from '@mui/material';
import { pushState } from 'client/helpers/routing';
import rnaLogo from 'client/images/RNA-white-2.png';

const NavLoggedOut = () => {
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
        <Button
          color="inherit"
          variant="outlined"
          sx={{ backgroundColor: 'white', color: 'black', mr: 1 }}
          onClick={() => pushState('/styleguide')}
        >
          Styleguide
        </Button>
        <Button
          color="inherit"
          variant="outlined"
          sx={{ backgroundColor: 'white', color: 'black', mr: 1 }}
          onClick={() => pushState('/login')}
        >
          Login
        </Button>
        <Button
          color="inherit"
          variant="outlined"
          sx={{ backgroundColor: 'white', color: 'black' }}
          onClick={() => pushState('/signup')}
        >
          Signup
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default NavLoggedOut;
