import { RefObject } from 'react';
import { Box, Container, Typography } from '@mui/material';
import Nav from 'client/components/Nav';

type HomeProps = {
  currentUserRef: RefObject<Record<string, any> | null>;
  loadCookieSession: () => Promise<void>;
};

const Home = ({ currentUserRef, loadCookieSession }: HomeProps) => {
  const currentUser = currentUserRef.current;
  const userEmail = currentUser?.email || '';
  const isEmailVerified = Boolean(currentUser?.emailVerified);

  return (
    <Box className="app">
      <Nav
        userEmail={userEmail}
        isEmailVerified={isEmailVerified}
        loadCookieSession={loadCookieSession}
      />
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
