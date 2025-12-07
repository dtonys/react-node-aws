import { Box, Container, Typography, Button } from '@mui/material';
import { useState } from 'react';
import rnaLogo from 'client/images/RNA.png';

type HomeProps = {
  currentUser: Record<string, any> | null;
};

const Home = ({ currentUser }: HomeProps) => {
  const userEmail = currentUser?.email || '';
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout error:', err);
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 3,
        }}
      >
        <Box
          component="img"
          src={rnaLogo}
          alt="Logo"
          sx={{
            maxWidth: '50%',
            height: 'auto',
          }}
        />
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {userEmail}
        </Typography>
        <Button variant="outlined" onClick={handleLogout} disabled={isLoading} sx={{ mt: 2 }}>
          {isLoading ? 'Logging out...' : 'Logout'}
        </Button>
      </Box>
    </Container>
  );
};

export default Home;
