import { Box, Container, Typography } from '@mui/material';
import Nav from 'client/components/Nav';

type HomeProps = {
  currentUser: Record<string, any> | null;
};

const Home = ({ currentUser }: HomeProps) => {
  const userEmail = currentUser?.email || '';

  return (
    <Box>
      <Nav userEmail={userEmail} />
      <Container maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 'calc(100vh - 64px)',
            gap: 3,
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
