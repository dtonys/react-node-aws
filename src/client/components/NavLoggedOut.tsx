import { AppBar, Box, Toolbar, Typography, Button } from '@mui/material';
import { replaceState } from 'client/helpers/routing';
import rnaLogo from 'client/images/RNA-white-2.png';

const NavLoggedOut = () => {
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
          onClick={() => replaceState('/login')}
        >
          Login
        </Button>
        <Button
          color="inherit"
          variant="outlined"
          sx={{ backgroundColor: 'white', color: 'black' }}
          onClick={() => replaceState('/signup')}
        >
          Signup
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default NavLoggedOut;
