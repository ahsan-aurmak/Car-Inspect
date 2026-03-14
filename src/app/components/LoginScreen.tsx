import { useNavigate } from 'react-router';
import { useState } from 'react';
import { Container, Button, Card, CardContent, TextField, Typography, Box } from '@mui/material';

export default function LoginScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Credential-free login - fields are optional
    localStorage.setItem('isLoggedIn', 'true');
    navigate('/dashboard');
  };

  return (
    <div className="mobile-container" style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Background Image with Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(https://images.unsplash.com/photo-1769218402167-b0ef15eaf7cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBpbnNwZWN0aW9uJTIwbWVjaGFuaWMlMjB3b3Jrc2hvcHxlbnwxfHx8fDE3NzExMDY1NTl8MA&ixlib=rb-4.1.0&q=80&w=1080)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(3px)'
          }
        }}
      />
      
      {/* Content */}
      <Container 
        sx={{ 
          position: 'relative',
          zIndex: 1,
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          px: 2,
          py: 4
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 6, maxWidth: 400, width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: 2,
                bgcolor: '#9C27B0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(156, 39, 176, 0.3)'
              }}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 11L12 14L22 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Box>
          </Box>
          <Typography variant="h4" component="h1" className="logo-text" sx={{ mb: 1, fontWeight: 700 }}>
            Car Inspect
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Fresh local app
          </Typography>
        </Box>

        <Card sx={{ width: '100%', maxWidth: 400, boxShadow: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              align="center" 
              sx={{ mb: 4 }}
            >
              Professional vehicle inspection for rentals, dealers, and insurance
            </Typography>
            
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                type="email"
                label="Email (optional)"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                variant="outlined"
              />

              <TextField
                fullWidth
                type="password"
                label="Password (optional)"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="outlined"
              />

              <Button 
                onClick={handleLogin} 
                variant="contained" 
                fullWidth
                size="large"
                sx={{ py: 1.5 }}
              >
                Log in
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Typography 
          variant="caption" 
          color="text.secondary" 
          align="center" 
          sx={{ mt: 4 }}
        >
          AI-powered vehicle inspection solution
        </Typography>
      </Container>
    </div>
  );
}
