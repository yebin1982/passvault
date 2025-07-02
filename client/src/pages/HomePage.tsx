import { Box, Button, Container, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const HomePage = () => {
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h4" gutterBottom>
          Welcome to PassVault
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center">
          Your secure and simple password manager.
        </Typography>
        <Box sx={{ mt: 4, width: '100%' }}>
          <Button
            component={RouterLink}
            to="/login"
            fullWidth
            variant="contained"
            sx={{ mb: 2 }}
          >
            Login
          </Button>
          <Button component={RouterLink} to="/register" fullWidth variant="outlined">
            Register
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default HomePage;