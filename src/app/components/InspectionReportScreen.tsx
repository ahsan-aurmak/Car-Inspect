import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Container,
  Card,
  CardContent,
  Button,
  Typography,
  Box,
  Alert,
  Chip,
  FormControlLabel,
  Checkbox,
  IconButton
} from '@mui/material';
import { ArrowLeft, Building2, Calendar, Clock, FileText, Share2, Upload, CheckSquare, Save } from 'lucide-react';
import OfflineIndicator, { useOnlineStatus } from './OfflineIndicator';
import { clearCurrentDraft } from '../utils/offlineStorage';
import SaveDraftModal from './SaveDraftModal';
import { generateInspectionPDF } from '../utils/pdfGenerator';

export default function InspectionReportScreen() {
  const navigate = useNavigate();
  const [inspectionDate] = useState(new Date());
  const [showSaveDraftModal, setShowSaveDraftModal] = useState(false);
  const [observations, setObservations] = useState<any[]>([]);
  const [selectedObservations, setSelectedObservations] = useState<Set<string>>(new Set());
  const vehicleName = sessionStorage.getItem('selectedVehicleName') || 'Unknown Vehicle';
  const inspectionType = sessionStorage.getItem('inspectionType') || 'unknown';
  const isOnline = useOnlineStatus();

  const getInspectionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'pre-move-in': 'Pre-move-in inventory',
      'mid-tenancy': 'Mid tenancy inspection',
      'end-of-tenancy': 'End of tenancy checkout',
    };
    return labels[type] || type;
  };

  useEffect(() => {
    const data = JSON.parse(sessionStorage.getItem('inspectionData') || '{"observations":[]}');
    setObservations(data.observations || []);
    // By default, select all observations
    const allObservationIds = new Set((data.observations || []).map((observation: any) => observation.id));
    setSelectedObservations(allObservationIds);
  }, []);

  const handleToggleObservation = (observationId: string) => {
    const newSelected = new Set(selectedObservations);
    if (newSelected.has(observationId)) {
      newSelected.delete(observationId);
    } else {
      newSelected.add(observationId);
    }
    setSelectedObservations(newSelected);
  };

  const handleSelectAll = () => {
    const allObservationIds = new Set(observations.map((observation: any) => observation.id));
    setSelectedObservations(allObservationIds);
  };

  const handleDeselectAll = () => {
    setSelectedObservations(new Set());
  };

  const handleSubmitToPlatform = () => {
    if (selectedObservations.size === 0) {
      alert('Please select at least one observation to submit to Platform');
      return;
    }
    
    // If offline, show save draft modal
    if (!isOnline) {
      handleSaveDraft();
      return;
    }
    
    // Generate individual Platform reference for each selected observation
    const baseReference = Math.floor(Math.random() * 100000000);
    let referenceCounter = 0;
    
    // Add Platform references to selected observations
    const updatedObservations = observations.map(observation => {
      if (selectedObservations.has(observation.id)) {
        const platformReference = `IS${(baseReference + referenceCounter).toString().padStart(8, '0')}`;
        referenceCounter++;
        return {
          ...observation,
          platformReference,
          submittedToPlatform: true,
          submissionDate: new Date().toISOString()
        };
      }
      return observation;
    });
    
    // Save report to localStorage with submitted observations tracked
    const confirmedVehicleData = JSON.parse(sessionStorage.getItem('confirmedVehicleData') || '{}');
    const reportData = {
      id: Date.now().toString(),
      vehicleName,
      inspectionType,
      date: inspectionDate.toISOString(),
      observations: updatedObservations,
      selectedObservationsForPlatform: Array.from(selectedObservations),
      submittedObservationsIds: [], // Track which observations have been submitted to Platform
      observationsCount: observations.length,
      urgentCount: priorityCounts.urgent,
      platformLink: 'https://platform.com/reports/demo-' + Date.now(),
      vehicleData: confirmedVehicleData, // Include full vehicle data with Pakistani verification
    };

    const savedReports = JSON.parse(localStorage.getItem('savedReports') || '[]');
    savedReports.push(reportData);
    localStorage.setItem('savedReports', JSON.stringify(savedReports));
    
    // Store selected observations with Platform references for submission confirmation screen
    const selectedObservationsArray = updatedObservations.filter(observation => selectedObservations.has(observation.id));
    sessionStorage.setItem('platformSelectedObservations', JSON.stringify(selectedObservationsArray));
    sessionStorage.setItem('successType', 'submitted');
    
    // Clear inspection data
    sessionStorage.removeItem('inspectionData');
    sessionStorage.removeItem('selectedVehicleName');
    sessionStorage.removeItem('inspectionType');
    clearCurrentDraft();
    
    navigate('/submission-confirmation');
  };

  const handleSaveDraft = () => {
    // Save report to localStorage as draft
    const confirmedVehicleData = JSON.parse(sessionStorage.getItem('confirmedVehicleData') || '{}');
    const reportData = {
      id: Date.now().toString(),
      vehicleName,
      inspectionType,
      date: inspectionDate.toISOString(),
      observations: observations,
      selectedObservationsForPlatform: Array.from(selectedObservations),
      submittedObservationsIds: [],
      observationsCount: observations.length,
      urgentCount: priorityCounts.urgent,
      vehicleData: confirmedVehicleData, // Include full vehicle data with Pakistani verification
    };

    const savedReports = JSON.parse(localStorage.getItem('savedReports') || '[]');
    savedReports.push(reportData);
    localStorage.setItem('savedReports', JSON.stringify(savedReports));

    // Clear inspection data
    sessionStorage.removeItem('inspectionData');
    
    // Show draft saved modal
    setShowSaveDraftModal(true);
  };

  const handleSaveReport = () => {
    // Save report to localStorage
    const confirmedVehicleData = JSON.parse(sessionStorage.getItem('confirmedVehicleData') || '{}');
    const reportData = {
      id: Date.now().toString(),
      vehicleName,
      inspectionType,
      date: inspectionDate.toISOString(),
      observations: observations,
      selectedObservationsForPlatform: Array.from(selectedObservations),
      submittedObservationsIds: [], // Track which observations have been submitted to Platform
      observationsCount: observations.length,
      urgentCount: priorityCounts.urgent,
      vehicleData: confirmedVehicleData, // Include full vehicle data with Pakistani verification
    };

    const savedReports = JSON.parse(localStorage.getItem('savedReports') || '[]');
    savedReports.push(reportData);
    localStorage.setItem('savedReports', JSON.stringify(savedReports));

    // Store data for success screen
    sessionStorage.setItem('successType', 'saved');
    sessionStorage.setItem('savedObservationsCount', observations.length.toString());
    sessionStorage.setItem('savedVehicleName', vehicleName);

    // Clear inspection data
    sessionStorage.removeItem('inspectionData');
    sessionStorage.removeItem('selectedVehicleName');
    sessionStorage.removeItem('inspectionType');
    clearCurrentDraft();

    navigate('/submission-confirmation');
  };

  const handleExportPDF = async () => {
    try {
      const confirmedVehicleData = JSON.parse(sessionStorage.getItem('confirmedVehicleData') || '{}');
      await generateInspectionPDF(
        vehicleName,
        inspectionType,
        inspectionDate,
        observations,
        confirmedVehicleData
      );
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleShareReport = () => {
    alert('Share functionality would be implemented here');
  };

  const priorityCounts = {
    requiresAttention: observations.filter(i => !i.isObservation).length,
    noActionRequired: observations.filter(i => i.isObservation).length,
    urgent: observations.filter(i => i.urgent === true).length,
    normal: observations.filter(i => !i.urgent).length,
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <OfflineIndicator />
      
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => {
            const lastObservationId = sessionStorage.getItem('lastAIReviewObservationId');
            if (lastObservationId) {
              navigate(`/ai-review/${lastObservationId}`);
            } else {
              navigate('/dashboard');
            }
          }} sx={{ mr: 1 }}>
            <ArrowLeft size={24} />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Inspection Report</Typography>
        </Box>
        <OfflineIndicator />
      </Box>

      <Container sx={{ py: 3, pb: 5 }}>
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Building2 size={18} style={{ marginRight: 12, color: '#5F6368' }} />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>{vehicleName}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Calendar size={16} style={{ marginRight: 8, color: '#5F6368' }} />
                <Typography variant="body2" color="text.secondary">{inspectionDate.toLocaleDateString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Clock size={16} style={{ marginRight: 8, color: '#5F6368' }} />
                <Typography variant="body2" color="text.secondary">{inspectionDate.toLocaleTimeString()}</Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-around', pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ mb: 0.5 }}>{observations.length}</Typography>
                <Typography variant="caption" color="text.secondary">Total observations</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ mb: 0.5, color: 'warning.main' }}>{priorityCounts.requiresAttention}</Typography>
                <Typography variant="caption" color="text.secondary">Requires attention</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ mb: 0.5, color: 'success.main' }}>{priorityCounts.noActionRequired}</Typography>
                <Typography variant="caption" color="text.secondary">No action required</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Alert severity="info" sx={{ mb: 3, display: 'flex', alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
            <CheckSquare size={20} style={{ marginRight: 12, flexShrink: 0, marginTop: 4 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Select Observations for Platform</Typography>
              <Typography variant="body2">
                Choose which observations you want to submit to Platform. You can keep other observations in your report without sending them.
              </Typography>
            </Box>
          </Box>
        </Alert>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
          <Button 
            variant="outlined" 
            size="small"
            onClick={handleSelectAll}
          >
            Select all
          </Button>
          <Button 
            variant="outlined" 
            size="small"
            onClick={handleDeselectAll}
            sx={{ color: 'text.secondary', borderColor: 'divider' }}
          >
            Deselect all
          </Button>
          <Box sx={{ ml: 'auto' }}>
            <Chip label={`${selectedObservations.size} of ${observations.length} selected`} color="primary" />
          </Box>
        </Box>

        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>All Observations</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {observations.map((observation, index) => (
                <Card 
                  key={index} 
                  sx={{ 
                    borderRadius: 3,
                    borderLeft: observation.isObservation ? '4px solid #4CAF50' : '4px solid #ff9800',
                    bgcolor: observation.isObservation ? '#f1f8f4' : 'white'
                  }}
                >
                  {observation.photo && (
                    <Box sx={{ overflow: 'hidden', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
                      <img
                        src={observation.photo}
                        alt={observation.title}
                        style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }}
                      />
                    </Box>
                  )}
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{observation.title}</Typography>
                      <Chip 
                        label={observation.isObservation ? 'No Action Required' : 'Requires Attention'} 
                        size="small"
                        color={observation.isObservation ? 'success' : 'warning'}
                        sx={{ fontSize: '0.65rem', height: 20 }}
                      />
                    </Box>
                    
                    <Typography variant="body2" sx={{ mb: 3 }}>{observation.description}</Typography>
                    
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedObservations.has(observation.id)}
                          onChange={() => handleToggleObservation(observation.id)}
                        />
                      }
                      label="Raise this observation in Platform"
                    />
                  </CardContent>
                </Card>
              ))}
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button 
            onClick={handleSaveReport} 
            variant="outlined"
            sx={{ py: 2 }}
          >
            <Save size={20} style={{ marginRight: 8 }} />
            Save inspection
          </Button>
          <Button 
            onClick={handleSubmitToPlatform} 
            variant="contained"
            sx={{ py: 2 }}
            disabled={selectedObservations.size === 0}
          >
            <Upload size={20} style={{ marginRight: 8 }} />
            Save & submit to Platform ({selectedObservations.size} observation{selectedObservations.size !== 1 ? 's' : ''})
          </Button>
          <Button 
            onClick={handleExportPDF} 
            variant="outlined"
            sx={{ py: 1.5, color: 'text.secondary', borderColor: 'divider' }}
          >
            <FileText size={20} style={{ marginRight: 8 }} />
            Export PDF
          </Button>
          <Button 
            onClick={handleShareReport} 
            variant="outlined"
            sx={{ py: 1.5, color: 'text.secondary', borderColor: 'divider' }}
          >
            <Share2 size={20} style={{ marginRight: 8 }} />
            Share inspection
          </Button>
        </Box>
      </Container>



      {/* Save Draft Modal */}
      <SaveDraftModal
        show={showSaveDraftModal}
        onStartNewWalkthrough={() => {
          setShowSaveDraftModal(false);
          navigate('/dashboard');
        }}
        onViewDrafts={() => {
          setShowSaveDraftModal(false);
          clearCurrentDraft();
          navigate('/dashboard');
        }}
      />
    </Box>
  );
}