import { Box, Container, TextField, Button, Link, Typography } from '@mui/material';
import { useState } from 'react';
import { onLinkClick, replaceState } from 'client/helpers/routing';
import fetchClient from 'client/helpers/fetchClient';
import { ForgotPasswordRequest } from 'shared/types/auth';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await fetchClient.post<ForgotPasswordRequest>('/api/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err) {
      const error = err as Error & { data?: { message?: string } };
      setError(error.data?.message || error.message || 'An error occurred');
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
        <Typography variant="h4" component="h1" gutterBottom>
          Forgot Password
        </Typography>
        {success ? (
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="body1" color="success.main">
              If an account with that email exists, we've sent you a password reset link.
            </Typography>
            <Button variant="contained" fullWidth size="large" onClick={() => replaceState('/login')}>
              Back to Login
            </Button>
          </Box>
        ) : (
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}
          >
            <Typography variant="body2" color="text.secondary">
              Enter your email address and we'll send you a link to reset your password.
            </Typography>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
            <Button type="submit" variant="contained" fullWidth size="large" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Submit'}
            </Button>
            <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
              <Link href="/login" onClick={onLinkClick} underline="hover">
                Back to Login
              </Link>
            </Box>
          </Box>
        )}
        <Box sx={{ height: '200px' }} />
      </Box>
    </Container>
  );
};

export default ForgotPassword;
