import {
  Box,
  Container,
  TextField,
  Button,
  Link,
  Typography,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useState } from 'react';
import { onLinkClick, replaceState } from 'client/helpers/routing';
import fetchClient from 'client/helpers/fetchClient';
import { ResetPasswordRequest, PASSWORD_MIN_LENGTH, PASSWORD_VALIDATION_MESSAGE } from 'shared/types/auth';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isPasswordValid = password.length >= PASSWORD_MIN_LENGTH;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const params = new URLSearchParams(window.location.search);
    const email = params.get('email');
    const token = params.get('token');

    if (!isPasswordValid) {
      setError(PASSWORD_VALIDATION_MESSAGE);
      setIsLoading(false);
      return;
    }

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
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="off"
              required
              error={Boolean(password) && !isPasswordValid}
              helperText={Boolean(password) && !isPasswordValid ? PASSWORD_VALIDATION_MESSAGE : ''}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="off"
              required
              error={Boolean(confirmPassword) && confirmPassword !== password}
              helperText={Boolean(confirmPassword) && confirmPassword !== password ? 'Passwords do not match' : ''}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
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
