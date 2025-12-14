import { Box, Container, Link, Typography } from '@mui/material';
import { RefObject } from 'react';
import { onLinkClick } from 'client/helpers/routing';

type ErrorProps = {
  currentUserRef: RefObject<Record<string, any> | null>;
};

const Error = ({ currentUserRef }: ErrorProps) => {
  const isLoggedIn = Boolean(currentUserRef.current);

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
        <Typography variant="h2" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
          Something went wrong
        </Typography>
        {isLoggedIn ? (
          <Link href="/" onClick={onLinkClick} underline="hover">
            Home
          </Link>
        ) : (
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link href="/login" onClick={onLinkClick} underline="hover">
              Login
            </Link>
            <Link href="/signup" onClick={onLinkClick} underline="hover">
              Signup
            </Link>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Error;
