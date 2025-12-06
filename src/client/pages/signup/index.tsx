import { Box, Container, TextField, Button, Link, Typography } from '@mui/material';
import { useState } from 'react';
import onLinkClick from '../../helpers/onLinkClick';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle signup logic here
    console.log('Signup:', { email, password, confirmPassword });
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
          Signup
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
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
          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="contained" fullWidth size="large">
            Submit
          </Button>
          <Box sx={{ textAlign: 'left' }}>
            <Link href="/login" onClick={onLinkClick} underline="hover">
              Login
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Signup;