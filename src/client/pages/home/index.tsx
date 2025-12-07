import { Box, Container, Typography } from '@mui/material';
import rnaLogo from 'client/images/RNA.png';

type HomeProps = {
  currentUser: Record<string, any> | null;
};

const Home = ({ currentUser }: HomeProps) => {
  const userEmail = currentUser?.email || '';

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
      </Box>
    </Container>
  );
};

export default Home;
