import { Box, Typography } from '@mui/material';

const HomePage = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}
    >
      <Typography variant="h3" sx={{ mb: 4 }}>
        Welcome
      </Typography>
    </Box>
  );
};

export { HomePage };
export default HomePage;
