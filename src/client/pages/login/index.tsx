import { Box, Container, TextField, Button, Link, Typography } from '@mui/material';
import { useState } from 'react';
import onLinkClick from '../../helpers/onLinkClick';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login:', { email, password });
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
          <Button type="submit" variant="contained" fullWidth size="large">
            Submit
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
      </Box>
    </Container>
  );
};

export default Login;
