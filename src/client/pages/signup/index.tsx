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
import { useNotification } from 'client/components/NotificationContext';
import rnaLogo from 'client/images/RNA-white-2.png';
import { SignupRequest, PASSWORD_MIN_LENGTH, PASSWORD_VALIDATION_MESSAGE } from 'shared/types/auth';

type SignupProps = {
  loadCookieSession: () => Promise<void>;
};

const Signup = ({ loadCookieSession }: SignupProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useNotification();

  const isPasswordValid = password.length >= PASSWORD_MIN_LENGTH;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setError(PASSWORD_VALIDATION_MESSAGE);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await fetchClient.post<SignupRequest>('/api/auth/signup', {
        email,
        password,
        confirmPassword,
      });
      await loadCookieSession();
      showSuccess('Signup successful');
      // Redirect to home on success
      replaceState('/');
    } catch (err) {
      const error = err as Error & { data?: { message?: string } };
      const errorMessage =
        error.data?.message || error.message || 'An error occurred during signup';
      setError(errorMessage);
      showError(errorMessage);
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
          Signup
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}
        >
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
            {isLoading ? 'Signing up...' : 'Submit'}
          </Button>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/login" onClick={onLinkClick} underline="hover">
              Login
            </Link>
          </Box>
        </Box>
        <Box sx={{ height: '200px' }} />
      </Box>
    </Container>
  );
};

export default Signup;
