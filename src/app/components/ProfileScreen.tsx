import { useNavigate } from 'react-router';
import { 
  Container, 
  Card, 
  CardContent, 
  List, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Button, 
  Typography, 
  Box, 
  Avatar 
} from '@mui/material';
import { User, LogOut, Bell, Lock, HelpCircle, Info } from 'lucide-react';
import BottomNavigation from './BottomNavigation';

export default function ProfileScreen() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear all inspection data from storage
    sessionStorage.clear();
    localStorage.clear();
    
    // Navigate to login screen
    navigate('/login');
  };

  // Get user info from session storage (set during login)
  const userEmail = sessionStorage.getItem('userEmail') || 'inspector@carmak.com';

  return (
    <div className="mobile-container with-bottom-nav">
      {/* Header */}
      <Box className="app-header">
        <Container sx={{ py: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Profile
          </Typography>
        </Container>
      </Box>

      <Container sx={{ py: 3 }}>
        {/* User Info Card */}
        <Card sx={{ mb: 3, boxShadow: 2 }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'primary.main',
                mx: 'auto',
                mb: 2
              }}
            >
              <User size={40} />
            </Avatar>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
              Vehicle Inspector
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {userEmail}
            </Typography>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, mt: 4 }}>
          Account Settings
        </Typography>
        <Card sx={{ mb: 3, boxShadow: 1 }}>
          <List disablePadding>
            <ListItemButton 
              sx={{ py: 2 }}
              onClick={() => {/* Add notification settings handler */}}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Bell size={20} style={{ color: '#9C27B0' }} />
              </ListItemIcon>
              <ListItemText primary="Notifications" />
            </ListItemButton>
            <ListItemButton 
              sx={{ py: 2 }}
              onClick={() => {/* Add privacy settings handler */}}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Lock size={20} style={{ color: '#9C27B0' }} />
              </ListItemIcon>
              <ListItemText primary="Privacy & Security" />
            </ListItemButton>
          </List>
        </Card>

        {/* Support */}
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, mt: 4 }}>
          Support
        </Typography>
        <Card sx={{ mb: 3, boxShadow: 1 }}>
          <List disablePadding>
            <ListItemButton 
              sx={{ py: 2 }}
              onClick={() => {/* Add help handler */}}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <HelpCircle size={20} style={{ color: '#9C27B0' }} />
              </ListItemIcon>
              <ListItemText primary="Help Center" />
            </ListItemButton>
            <ListItemButton 
              sx={{ py: 2 }}
              onClick={() => {/* Add about handler */}}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Info size={20} style={{ color: '#9C27B0' }} />
              </ListItemIcon>
              <ListItemText primary="About Car Inspect" />
            </ListItemButton>
          </List>
        </Card>

        {/* App Version */}
        <Typography 
          variant="caption" 
          color="text.secondary" 
          align="center" 
          display="block" 
          sx={{ mb: 3 }}
        >
          Version 1.0.0
        </Typography>

        {/* Logout Button */}
        <Button 
          variant="outlined" 
          color="error"
          fullWidth
          size="large"
          startIcon={<LogOut size={20} />}
          onClick={handleLogout}
          sx={{ py: 1.5 }}
        >
          Logout
        </Button>

        <Box sx={{ mb: 6 }} />
      </Container>

      <BottomNavigation />
    </div>
  );
}
