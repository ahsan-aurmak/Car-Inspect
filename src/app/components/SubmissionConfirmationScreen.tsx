import { useNavigate } from 'react-router';
import { Container, Card, CardContent, Button, Typography, Box } from '@mui/material';
import { CheckCircle2, Home, History, Circle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { clearCurrentDraft } from '../utils/offlineStorage';

export default function SubmissionConfirmationScreen() {
  const navigate = useNavigate();
  const [successType, setSuccessType] = useState<'saved' | 'submitted'>('submitted');
  const [observationsCount, setObservationsCount] = useState(0);
  const [submittedObservations, setSubmittedObservations] = useState<any[]>([]);

  useEffect(() => {
    const type = sessionStorage.getItem('successType') || 'submitted';
    setSuccessType(type as 'saved' | 'submitted');

    if (type === 'submitted') {
      // For Platform submissions - get observations with their individual references
      const platformSelectedObservations = JSON.parse(sessionStorage.getItem('platformSelectedObservations') || '[]');
      setObservationsCount(platformSelectedObservations.length);
      setSubmittedObservations(platformSelectedObservations);
    } else {
      // For saved reports
      const count = parseInt(sessionStorage.getItem('savedObservationsCount') || '0');
      setObservationsCount(count);
    }
  }, []);

  const handleNewInspection = () => {
    // Clear session data
    sessionStorage.clear();
    clearCurrentDraft();
    navigate('/dashboard');
  };

  const handleViewReports = () => {
    sessionStorage.clear();
    navigate('/reports-history');
  };

  const isSaved = successType === 'saved';

  return (
    <div className="mobile-container">
      <Container 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: '100vh',
          p: 3
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              border: '4px solid #28a745',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3
            }}
          >
            <CheckCircle2
              size={48}
              style={{ color: '#28a745', strokeWidth: 3 }}
            />
          </Box>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            {isSaved ? 'Report Saved Successfully' : 'Successfully Submitted'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isSaved 
              ? `Your inspection report with ${observationsCount} observation${observationsCount !== 1 ? 's' : ''} has been saved`
              : `Your inspection report has been submitted to Platform`
            }
          </Typography>
        </Box>

        {!isSaved && submittedObservations.length > 0 && (
          <Card sx={{ width: '100%', maxWidth: 600, boxShadow: 2, mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Issues submitted to Platform
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                {submittedObservations.length} observation{submittedObservations.length !== 1 ? 's' : ''} submitted — each with a unique reference
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {submittedObservations.map((observation, index) => (
                  <Box 
                    key={observation.id}
                    sx={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 1.5,
                      px: 2,
                      bgcolor: '#f5f5f5', 
                      border: '1px solid #e0e0e0',
                      borderRadius: 1
                    }}
                  >
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                      {observation.room} {observation.category}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.primary', letterSpacing: 0.5, fontFamily: 'monospace' }}>
                      {observation.platformReference}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        )}

        <Card sx={{ width: '100%', maxWidth: 600, boxShadow: 2, mb: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Next Steps
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {isSaved ? (
                <>
                  <Box component="li" sx={{ mb: 2, display: 'flex', alignItems: 'flex-start' }}>
                    <Circle size={8} style={{ marginRight: '8px', marginTop: '6px', color: '#5F6368', flexShrink: 0 }} />
                    <Typography variant="body2" color="text.secondary">
                      Your report is saved and ready to view
                    </Typography>
                  </Box>
                  <Box component="li" sx={{ mb: 2, display: 'flex', alignItems: 'flex-start' }}>
                    <Circle size={8} style={{ marginRight: '8px', marginTop: '6px', color: '#5F6368', flexShrink: 0 }} />
                    <Typography variant="body2" color="text.secondary">
                      You can submit issues to Platform anytime from Saved Reports
                    </Typography>
                  </Box>
                  <Box component="li" sx={{ mb: 2, display: 'flex', alignItems: 'flex-start' }}>
                    <Circle size={8} style={{ marginRight: '8px', marginTop: '6px', color: '#5F6368', flexShrink: 0 }} />
                    <Typography variant="body2" color="text.secondary">
                      Access your saved reports from the dashboard
                    </Typography>
                  </Box>
                  <Box component="li" sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Circle size={8} style={{ marginRight: '8px', marginTop: '6px', color: '#5F6368', flexShrink: 0 }} />
                    <Typography variant="body2" color="text.secondary">
                      Start a new inspection when ready
                    </Typography>
                  </Box>
                </>
              ) : (
                <>
                  <Box component="li" sx={{ mb: 2, display: 'flex', alignItems: 'flex-start' }}>
                    <Circle size={8} style={{ marginRight: '8px', marginTop: '6px', color: '#5F6368', flexShrink: 0 }} />
                    <Typography variant="body2" color="text.secondary">
                      Your report is now being processed
                    </Typography>
                  </Box>
                  <Box component="li" sx={{ mb: 2, display: 'flex', alignItems: 'flex-start' }}>
                    <Circle size={8} style={{ marginRight: '8px', marginTop: '6px', color: '#5F6368', flexShrink: 0 }} />
                    <Typography variant="body2" color="text.secondary">
                      Platform will review the issues and assign priorities
                    </Typography>
                  </Box>
                  <Box component="li" sx={{ mb: 2, display: 'flex', alignItems: 'flex-start' }}>
                    <Circle size={8} style={{ marginRight: '8px', marginTop: '6px', color: '#5F6368', flexShrink: 0 }} />
                    <Typography variant="body2" color="text.secondary">
                      Maintenance requests will be created automatically
                    </Typography>
                  </Box>
                  <Box component="li" sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Circle size={8} style={{ marginRight: '8px', marginTop: '6px', color: '#5F6368', flexShrink: 0 }} />
                    <Typography variant="body2" color="text.secondary">
                      You'll receive a confirmation email shortly
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ width: '100%', maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button 
            onClick={handleNewInspection} 
            variant="contained"
            fullWidth
            startIcon={<Home size={20} />}
            size="large"
            sx={{ py: 2, fontWeight: 500 }}
          >
            Start new inspection
          </Button>
          <Button 
            onClick={() => navigate('/dashboard')} 
            variant="outlined"
            fullWidth
            startIcon={<Home size={20} />}
            size="large"
            sx={{ py: 2, fontWeight: 500 }}
          >
            Back to home
          </Button>
          <Button 
            onClick={handleViewReports} 
            variant="outlined"
            color="inherit"
            fullWidth
            startIcon={<History size={20} />}
            size="large"
            sx={{ py: 2, fontWeight: 500 }}
          >
            View saved reports
          </Button>
        </Box>
      </Container>
    </div>
  );
}