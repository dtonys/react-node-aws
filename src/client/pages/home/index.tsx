import { Box, Container, Typography } from '@mui/material';
import Nav from 'client/components/Nav';

type HomeProps = {
  currentUser: Record<string, any> | null;
  loadCookieSession: () => Promise<void>;
};

const Home = ({ currentUser, loadCookieSession }: HomeProps) => {
  const userEmail = currentUser?.email || '';

  return (
    <Box className="app">
      <Nav userEmail={userEmail} loadCookieSession={loadCookieSession} />
      <Box className="content">
        <Container maxWidth="sm">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100%',
              gap: 3,
            }}
          >
            <Typography variant="h4" component="h1" gutterBottom>
              Welcome
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
