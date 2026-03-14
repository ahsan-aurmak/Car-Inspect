import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  Container, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Button,
  Chip
} from '@mui/material';
import { ClipboardList, History, Plus, Circle, FileText, Clock } from 'lucide-react';
import BottomNavigation from './BottomNavigation';
import OfflineIndicator from './OfflineIndicator';
import { getAllDrafts, resumeInspection, deleteDraft, InspectionProgress } from '../utils/offlineStorage';

export default function DashboardScreen() {
  const navigate = useNavigate();

  // Clean up old localStorage key (migration)
  useEffect(() => {
    const oldReports = localStorage.getItem('submittedReports');
    if (oldReports) {
      // Migrate old reports to new key
      const savedReports = JSON.parse(localStorage.getItem('savedReports') || '[]');
      const oldReportsData = JSON.parse(oldReports);
      
      // Only migrate if we don't already have saved reports
      if (savedReports.length === 0 && oldReportsData.length > 0) {
        localStorage.setItem('savedReports', oldReports);
      }
      
      // Remove old key
      localStorage.removeItem('submittedReports');
    }
  }, []);

  // Get count of saved reports
  const savedReports = JSON.parse(localStorage.getItem('savedReports') || '[]');
  const reportsCount = savedReports.length;

  // Get saved drafts
  const drafts = getAllDrafts();

  const handleResumeDraft = (draft: InspectionProgress) => {
    resumeInspection(draft);
    navigate(draft.currentStep);
  };

  const handleDeleteDraft = (draftId: string) => {
    if (confirm('Delete this draft? This action cannot be undone.')) {
      deleteDraft(draftId);
      window.location.reload();
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const getStepLabel = (step: string) => {
    const labels: Record<string, string> = {
      '/ai-processing': 'AI Processing',
      '/ai-review/': 'AI Review',
      '/inspection-report': 'Report Review',
      '/vehicle-capture': 'Capturing Vehicle',
      '/vehicle-confirmation': 'Confirming Details',
      '/vehicle-add-photo': 'Adding Photos',
    };
    
    // Check for partial matches (e.g., /ai-review/123)
    for (const [key, value] of Object.entries(labels)) {
      if (step.startsWith(key)) {
        return value;
      }
    }
    
    return 'In Progress';
  };

  return (
    <div className="mobile-container with-bottom-nav">
      <OfflineIndicator />
      
      <Box className="app-header" sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                bgcolor: '#9C27B0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px',
                boxShadow: '0 2px 8px rgba(156, 39, 176, 0.25)'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 11L12 14L22 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Box>
            <Box>
              <Typography variant="h6" className="logo-text" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                Car Inspect
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Inspection
              </Typography>
            </Box>
          </Box>
          <OfflineIndicator />
        </Box>
      </Box>

      <Container sx={{ py: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Welcome back!
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          What would you like to do today?
        </Typography>

        {/* Saved Drafts Section */}
        {drafts.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FileText size={18} style={{ marginRight: '8px', color: '#9C27B0' }} />
              <Typography variant="subtitle2">
                Saved Drafts
              </Typography>
            </Box>
            {drafts.map((draft) => (
              <Card 
                key={draft.id} 
                sx={{ 
                  mb: 2, 
                  borderRadius: 3,
                  boxShadow: 2,
                  border: '2px solid #9C27B0',
                  bgcolor: '#f8fbfd'
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {draft.vehicleName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        {getStepLabel(draft.currentStep)} • {formatTimestamp(draft.timestamp)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Clock size={12} style={{ color: '#5F6368' }} />
                        <Typography variant="caption" color="text.secondary">
                          {draft.inspectionData.observations?.length || 0} observations • Auto-saved
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, ml: 2, flexShrink: 0 }}>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleResumeDraft(draft)}
                      >
                        Resume
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleDeleteDraft(draft.id)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Card
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
            onClick={() => navigate('/inspection-type')}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
                  <Plus size={32} style={{ color: '#9C27B0' }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ mb: 0.5 }}>
                    Start new inspection
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Begin a vehicle inspection
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card
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
            onClick={() => navigate('/reports-history')}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: '#E1BEE7',
                      flexShrink: 0,
                      mr: 2
                    }}
                  >
                    <History size={32} style={{ color: '#9C27B0' }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ mb: 0.5 }}>
                      Saved Reports
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      View and manage saved reports
                    </Typography>
                  </Box>
                </Box>
                {reportsCount > 0 && (
                  <Chip 
                    label={reportsCount} 
                    color="primary" 
                    size="medium"
                  />
                )}
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ bgcolor: '#f8f9fa', boxShadow: 0 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <ClipboardList size={24} style={{ marginRight: '12px', color: '#5F6368', flexShrink: 0 }} />
                <Box sx={{ width: '100%' }}>
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    Quick Tips
                  </Typography>
                  <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                    <Box component="li" sx={{ mb: 2, display: 'flex', alignItems: 'flex-start' }}>
                      <Circle size={8} style={{ marginRight: '8px', marginTop: '4px', color: '#9C27B0', flexShrink: 0 }} />
                      <Typography variant="body2">
                        Take clear, well-lit photos for better AI analysis
                      </Typography>
                    </Box>
                    <Box component="li" sx={{ mb: 2, display: 'flex', alignItems: 'flex-start' }}>
                      <Circle size={8} style={{ marginRight: '8px', marginTop: '4px', color: '#9C27B0', flexShrink: 0 }} />
                      <Typography variant="body2">
                        Review AI suggestions before submitting
                      </Typography>
                    </Box>
                    <Box component="li" sx={{ mb: 2, display: 'flex', alignItems: 'flex-start' }}>
                      <Circle size={8} style={{ marginRight: '8px', marginTop: '4px', color: '#9C27B0', flexShrink: 0 }} />
                      <Typography variant="body2">
                        Add custom areas as needed during inspection
                      </Typography>
                    </Box>
                    <Box component="li" sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <Circle size={8} style={{ marginRight: '8px', marginTop: '4px', color: '#9C27B0', flexShrink: 0 }} />
                      <Typography variant="body2">
                        Document all vehicle areas systematically for complete reports
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>

      <BottomNavigation />
    </div>
  );
}
