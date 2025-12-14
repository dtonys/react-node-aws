import { Box, Container, TextField, Button, Link, Typography } from '@mui/material';
import { RefObject, useState } from 'react';
import { onLinkClick, replaceState } from 'client/helpers/routing';
import fetchClient from 'client/helpers/fetchClient';
import rnaLogo from 'client/images/RNA-white-2.png';
import { LoginRequest } from 'shared/types/auth';

type LoginProps = {
  loadCookieSession: () => Promise<void>;
};
const Login = ({ loadCookieSession }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await fetchClient.post<LoginRequest>('/api/auth/login', { email, password });
      await loadCookieSession();
      // Redirect to home on success
      replaceState('/');
    } catch (err) {
      const error = err as Error & { data?: { message?: string } };
      setError(error.data?.message || error.message || 'An error occurred during login');
      setIsLoading(false);
    }
  };

  const handleRedirectTest = async () => {
    try {
      await fetchClient.post('/api/auth/redirect-test');
    } catch (err) {
      const error = err as Error & { data?: { message?: string } };
      setError(error.data?.message || error.message || 'An error occurred');
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
          Login
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
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
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
        <Button variant="outlined" onClick={handleRedirectTest}>
          Test Redirect
        </Button>
        <Box sx={{ height: '200px' }} />
      </Box>
    </Container>
  );
};

export default Login;
