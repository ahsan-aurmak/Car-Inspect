import { useNavigate } from 'react-router';
import { Container, Card, CardContent, IconButton, Box, Typography } from '@mui/material';
import { ArrowLeft, Car, KeyRound, AlertCircle, ShoppingCart, Shield } from 'lucide-react';

const INSPECTION_TYPES = [
  {
    id: 'pre-rental',
    title: 'Pre-rental inspection',
    description: 'Document vehicle condition before issuing to renter',
    icon: KeyRound,
  },
  {
    id: 'post-rental',
    title: 'Post-rental inspection',
    description: 'Inspect vehicle condition when returned from rental',
    icon: Car,
  },
  {
    id: 'incident',
    title: 'Incident inspection',
    description: 'Document damage after accident or incident',
    icon: AlertCircle,
  },
  {
    id: 'pre-purchase',
    title: 'Pre-purchase inspection',
    description: 'Comprehensive check before buying used vehicle',
    icon: ShoppingCart,
  },
  {
    id: 'insurance',
    title: 'Insurance inspection',
    description: 'Document condition for insurance claim or policy',
    icon: Shield,
  },
];

export default function InspectionTypeScreen() {
  const navigate = useNavigate();

  const handleSelectType = (typeId: string) => {
    sessionStorage.setItem('inspectionType', typeId);
    navigate('/vehicle-capture');
  };

  return (
    <div className="mobile-container">
      <Box className="app-header" sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
        <IconButton edge="start" onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
          <ArrowLeft size={24} />
        </IconButton>
        <Typography variant="h6" component="h1">
          Inspection Type
        </Typography>
      </Box>

      <Container sx={{ py: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Select the type of vehicle inspection you want to perform:
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {INSPECTION_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <Card
                key={type.id}
                sx={{
                  boxShadow: 2,
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:active': {
                    transform: 'scale(0.98)'
                  },
                  '@media (min-width: 768px)': {
                    '&:hover': {
                      transform: 'scale(1.02)'
                    }
                  }
                }}
                onClick={() => handleSelectType(type.id)}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: '#F3E5F5',
                        mr: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <Icon size={32} style={{ color: '#9C27B0' }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        {type.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {type.description}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </Container>
    </div>
  );
}