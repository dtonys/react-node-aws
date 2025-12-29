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
import validator from 'validator';
import { onLinkClick, replaceState } from 'client/helpers/routing';
import fetchClient from 'client/helpers/fetchClient';
import { useNotification } from 'client/components/NotificationContext';
import rnaLogo from 'client/images/RNA-white-2.png';
import { LoginRequest, PASSWORD_MIN_LENGTH, PASSWORD_VALIDATION_MESSAGE } from 'shared/types/auth';

const EMAIL_VALIDATION_MESSAGE = 'Invalid email address';

type LoginProps = {
  loadCookieSession: () => Promise<void>;
};
const Login = ({ loadCookieSession }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useNotification();

  const isEmailValid = validator.isEmail(email);
  const showEmailError = emailTouched && !isEmailValid;
  const isPasswordValid = password.length >= PASSWORD_MIN_LENGTH;
  const showPasswordError = passwordTouched && !isPasswordValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validator.isEmail(email)) {
      setError(EMAIL_VALIDATION_MESSAGE);
      return;
    }
    if (!isPasswordValid) {
      setError(PASSWORD_VALIDATION_MESSAGE);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await fetchClient.post<LoginRequest>('/api/auth/login', { email, password });
      await loadCookieSession();
      showSuccess('Login successful');
      // Redirect to home on success
      replaceState('/');
    } catch (err) {
      const error = err as Error & { data?: { message?: string } };
      const errorMessage = error.data?.message || error.message || 'An error occurred during login';
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
          Sign in
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
            onBlur={() => setEmailTouched(true)}
            required
            error={showEmailError}
            helperText={showEmailError ? EMAIL_VALIDATION_MESSAGE : ''}
          />
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setPasswordTouched(true)}
            required
            error={showPasswordError}
            helperText={showPasswordError ? PASSWORD_VALIDATION_MESSAGE : ''}
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
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
          <Button type="submit" variant="contained" fullWidth size="large" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Submit'}
          </Button>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/signup" onClick={onLinkClick} underline="hover">
              Signup
            </Link>
            <Link href="/forgot-password" onClick={onLinkClick} underline="hover">
              Forgot password
            </Link>
          </Box>
        </Box>
        <Box sx={{ height: '200px' }} />
      </Box>
    </Container>
  );
};

export default Login;
