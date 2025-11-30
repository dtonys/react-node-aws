import { Box, Link } from '@mui/material';
import onLinkClick from '../../helpers/onLinkClick';

const Signup = () => {
  return (
    <Box>
      <Box>Signup</Box>
      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
        <Link href="/signup" onClick={onLinkClick}>
          /signup
        </Link>
        <Link href="/login" onClick={onLinkClick}>
          /login
        </Link>
      </Box>
    </Box>
  );
};

export default Signup;