import { Box, Container, TextField, Button, Link, Typography } from '@mui/material';
import { useState } from 'react';
import { onLinkClick, replaceState } from 'client/helpers/routing';
import fetchClient from 'client/helpers/fetchClient';
import { ResetPasswordRequest } from 'shared/types/auth';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const params = new URLSearchParams(window.location.search);
    const email = params.get('email');
    const token = params.get('token');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      // API will respond with 302 redirect, so fetchClient will handle navigation.
      await fetchClient.post<ResetPasswordRequest>('/api/auth/reset-password', {
        email: email!,
        token: token!,
        password,
        confirmPassword,
      });
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
          Reset Password
        </Typography>
        {success ? (
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="body1" color="success.main">
              Your password has been reset successfully.
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
              Enter your new password below.
            </Typography>
            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="off"
              required
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="off"
              required
            />
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
            <Button type="submit" variant="contained" fullWidth size="large" disabled={isLoading}>
              {isLoading ? 'Resetting...' : 'Submit'}
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

export default ResetPassword;
