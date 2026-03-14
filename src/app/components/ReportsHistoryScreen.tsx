import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Container,
  Card,
  CardContent,
  Button,
  Typography,
  Box,
  IconButton,
  Drawer
} from '@mui/material';
import { ArrowLeft, FileText, Calendar, Clock, ChevronRight, AlertTriangle } from 'lucide-react';
import BottomNavigation from './BottomNavigation';

interface SavedReport {
  id: string;
  propertyName: string;
  vehicleName: string;
  inspectionType: string;
  date: string;
  observationsCount?: number;
  issuesCount?: number; // Legacy support
  urgentCount?: number;
  highPriority?: number; // Legacy support
  observations?: any[];
  issues?: any[]; // Legacy support
  selectedObservationsForPlatform?: string[];
  selectedIssuesForPlatform?: string[]; // Legacy support
  submittedObservationsIds?: string[];
  submittedIssuesIds?: string[]; // Legacy support
  platformSubmitted?: boolean;
  platformLink?: string;
  vehicleData?: {
    pakistanVerification?: {
      registrationNo: string;
      make: string;
      vehicleModel: string;
      modelYear: string;
      bodyType: string;
      ownerName: string;
    };
  };
}

export default function ReportsHistoryScreen() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [showDeleteDrawer, setShowDeleteDrawer] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<SavedReport | null>(null);

  useEffect(() => {
    // Load saved reports from localStorage
    try {
      const savedReportsData = localStorage.getItem('savedReports');
      const savedReports = JSON.parse(savedReportsData || '[]');
      setReports(savedReports);
    } catch (error) {
      console.error('Error loading saved reports:', error);
      setReports([]);
    }
  }, []);

  const handleViewReport = (reportId: string) => {
    navigate(`/report/${reportId}`);
  };

  const handleDeleteReport = (report: SavedReport, e: React.MouseEvent) => {
    e.stopPropagation();
    setReportToDelete(report);
    setShowDeleteDrawer(true);
  };

  const confirmDeleteReport = () => {
    if (reportToDelete) {
      const updatedReports = reports.filter((report) => report.id !== reportToDelete.id);
      setReports(updatedReports);
      localStorage.setItem('savedReports', JSON.stringify(updatedReports));
      setShowDeleteDrawer(false);
      setReportToDelete(null);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 10 }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 1 }}>
          <ArrowLeft size={24} />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Saved Reports</Typography>
      </Box>

      <Container sx={{ py: 3, pb: 5, mb: 5 }}>
        {reports.length === 0 ? (
          <Card sx={{ textAlign: 'center', py: 5, boxShadow: 0, border: 'none' }}>
            <CardContent>
              <FileText size={64} style={{ color: '#9E9E9E', marginBottom: 24 }} />
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                No saved reports yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Complete an inspection and save the report to see it here
              </Typography>
              <Button 
                variant="contained"
                onClick={() => navigate('/dashboard')}
                sx={{ fontWeight: 600 }}
              >
                Start new inspection
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {reports.length} saved report{reports.length !== 1 ? 's' : ''}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {reports.map((report) => {
                // Support both old (issues) and new (observations) data structures
                const totalCount = report.observationsCount || report.issuesCount || 0;
                const submittedIds = report.submittedObservationsIds || report.submittedIssuesIds || [];
                const submittedCount = submittedIds.length;
                const pendingCount = totalCount - submittedCount;

                return (
                  <Card
                    key={report.id}
                    sx={{ 
                      cursor: 'pointer', 
                      borderRadius: 3,
                      bgcolor: '#f8f9fa',
                      border: '1px solid #e0e0e0',
                      transition: 'transform 0.2s',
                      '&:active': {
                        transform: 'scale(0.98)'
                      }
                    }}
                    onClick={() => handleViewReport(report.id)}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#9C27B0', mb: 0.5 }}>
                            {report.vehicleData?.pakistanVerification?.registrationNo || report.vehicleName || report.propertyName}
                          </Typography>
                          {report.vehicleData?.pakistanVerification && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              {report.vehicleData.pakistanVerification.make} {report.vehicleData.pakistanVerification.vehicleModel} ({report.vehicleData.pakistanVerification.modelYear})
                            </Typography>
                          )}
                        </Box>
                        <ChevronRight size={20} style={{ color: '#9C27B0', flexShrink: 0 }} />
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Calendar size={16} style={{ color: '#6c757d', flexShrink: 0 }} />
                          <Typography variant="body2" color="text.secondary">
                            {new Date(report.date).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Clock size={16} style={{ color: '#6c757d', flexShrink: 0 }} />
                          <Typography variant="body2" color="text.secondary">
                            {new Date(report.date).toLocaleTimeString('en-GB', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box 
                          sx={{ 
                            flex: 1,
                            textAlign: 'center',
                            bgcolor: '#d1e7f5',
                            borderRadius: 2,
                            py: 1.5,
                            px: 1
                          }}
                        >
                          <Typography variant="h5" sx={{ fontWeight: 700, color: '#9C27B0', lineHeight: 1.2 }}>
                            {totalCount}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                            Total Observations
                          </Typography>
                        </Box>
                        <Box 
                          sx={{ 
                            flex: 1,
                            textAlign: 'center',
                            bgcolor: '#d4edda',
                            borderRadius: 2,
                            py: 1.5,
                            px: 1
                          }}
                        >
                          <Typography variant="h5" sx={{ fontWeight: 700, color: '#28a745', lineHeight: 1.2 }}>
                            {submittedCount}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                            Submitted
                          </Typography>
                        </Box>
                        <Box 
                          sx={{ 
                            flex: 1,
                            textAlign: 'center',
                            bgcolor: '#fff3cd',
                            borderRadius: 2,
                            py: 1.5,
                            px: 1
                          }}
                        >
                          <Typography variant="h5" sx={{ fontWeight: 700, color: '#ffc107', lineHeight: 1.2 }}>
                            {pendingCount}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                            Pending
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          </>
        )}
      </Container>

      <BottomNavigation />

      {/* Delete Confirmation Bottom Sheet */}
      <Drawer 
        anchor="bottom"
        open={showDeleteDrawer} 
        onClose={() => setShowDeleteDrawer(false)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <AlertTriangle size={64} style={{ color: '#dc3545' }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'center', mb: 2 }}>
            Delete Report
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 4 }}>
            Are you sure you want to delete this report? This action cannot be undone.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              fullWidth 
              onClick={() => setShowDeleteDrawer(false)}
              sx={{ py: 1.5 }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              color="error" 
              fullWidth 
              onClick={confirmDeleteReport}
              sx={{ py: 1.5 }}
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
}