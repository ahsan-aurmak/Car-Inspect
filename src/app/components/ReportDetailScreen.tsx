import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
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
  IconButton,
  Drawer,
  CircularProgress
} from '@mui/material';
import { ArrowLeft, Building2, Calendar, Clock, ExternalLink, Trash2, Upload, CheckSquare, Check, X, AlertTriangle, Share2, FileDown, CheckCircle2 } from 'lucide-react';
import { generateInspectionPDF } from '../utils/pdfGenerator';

export default function ReportDetailScreen() {
  const navigate = useNavigate();
  const { reportId } = useParams();
  const [report, setReport] = useState<any>(null);
  const [showDeleteDrawer, setShowDeleteDrawer] = useState(false);
  const [selectedObservations, setSelectedObservations] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load report from localStorage
    const savedReports = JSON.parse(localStorage.getItem('savedReports') || '[]');
    const foundReport = savedReports.find((r: any) => r.id === reportId);
    if (foundReport) {
      setReport(foundReport);
      
      // Initialize selected observations with unsubmitted observations
      const submittedIds = foundReport.submittedObservationsIds || [];
      const unsubmittedObservations = (foundReport.observations || [])
        .filter((observation: any) => !submittedIds.includes(observation.id))
        .map((observation: any) => observation.id);
      setSelectedObservations(new Set(unsubmittedObservations));
    }
  }, [reportId]);

  const handleOpenPlatform = () => {
    if (report?.platformLink) {
      window.open(report.platformLink, '_blank');
    }
  };

  const handleDeleteReport = () => {
    const savedReports = JSON.parse(localStorage.getItem('savedReports') || '[]');
    const updatedReports = savedReports.filter((r: any) => r.id !== reportId);
    localStorage.setItem('savedReports', JSON.stringify(updatedReports));
    navigate('/reports-history');
  };

  if (!report) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ mb: 3 }} />
          <Typography variant="body2" color="text.secondary">Loading report...</Typography>
        </Box>
      </Box>
    );
  }

  const priorityCounts = {
    requiresAttention: report.observations?.filter((i: any) => !i.isObservation).length || 0,
    noActionRequired: report.observations?.filter((i: any) => i.isObservation).length || 0,
  };

  // Calculate unsubmitted observations
  const submittedIds = report.submittedObservationsIds || [];
  const unsubmittedObservations = (report.observations || []).filter((observation: any) => !submittedIds.includes(observation.id));
  const hasUnsubmittedObservations = unsubmittedObservations.length > 0;

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
    const allUnsubmittedIds = new Set(unsubmittedObservations.map((observation: any) => observation.id));
    setSelectedObservations(allUnsubmittedIds);
  };

  const handleDeselectAll = () => {
    setSelectedObservations(new Set());
  };

  const handleSubmitToPlatform = () => {
    if (selectedObservations.size === 0) {
      alert('Please select at least one observation to submit to Platform');
      return;
    }

    // Generate individual Platform reference for each selected observation
    const baseReference = Math.floor(Math.random() * 100000000);
    let referenceCounter = 0;

    // Add Platform references to selected observations
    const updatedObservations = report.observations.map((observation: any) => {
      if (selectedObservations.has(observation.id) && !observation.platformReference) {
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

    // Simulate Platform submission
    const newSubmittedIds = [...submittedIds, ...Array.from(selectedObservations)];
    
    // Update the report with newly submitted observation IDs and updated observations
    const savedReports = JSON.parse(localStorage.getItem('savedReports') || '[]');
    const reportIndex = savedReports.findIndex((r: any) => r.id === reportId);
    
    if (reportIndex >= 0) {
      savedReports[reportIndex].observations = updatedObservations;
      savedReports[reportIndex].submittedObservationsIds = newSubmittedIds;
      savedReports[reportIndex].platformLink = savedReports[reportIndex].platformLink || `https://platform.com/reports/${reportId}`;
      localStorage.setItem('savedReports', JSON.stringify(savedReports));
      
      // Store selected observations with Platform references for the confirmation screen
      const selectedObservationsArray = updatedObservations.filter((observation: any) => selectedObservations.has(observation.id));
      sessionStorage.setItem('platformSelectedObservations', JSON.stringify(selectedObservationsArray));
      sessionStorage.setItem('selectedVehicleName', report.vehicleName);
      sessionStorage.setItem('inspectionType', report.inspectionType);
      sessionStorage.setItem('successType', 'submitted');
      
      // Navigate to submission confirmation screen
      navigate('/submission-confirmation');
    }
  };

  const handleExportPDF = async () => {
    try {
      await generateInspectionPDF(
        report.vehicleName,
        report.inspectionType || 'inspection',
        new Date(report.date),
        report.observations || [],
        report.vehicleData // Include vehicle data with Pakistani verification
      );
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleShareInspection = async () => {
    const shareText = `Vehicle Inspection Report - ${report.vehicleName}\n${report.observationsCount} observations found\nDate: ${new Date(report.date).toLocaleDateString()}`;
    const shareUrl = window.location.href;

    // Check if Web Share API is available
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Vehicle Inspection Report',
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or error occurred
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
          // Fallback to clipboard
          copyToClipboard(shareUrl);
        }
      }
    } else {
      // Fallback: copy to clipboard
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        alert('Link copied to clipboard!');
      }).catch(() => {
        alert('Failed to copy link');
      });
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        alert('Link copied to clipboard!');
      } catch (err) {
        alert('Failed to copy link');
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <IconButton onClick={() => navigate('/reports-history')} sx={{ mr: 1 }}>
          <ArrowLeft size={24} />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Report Details</Typography>
      </Box>

      <Container sx={{ py: 3, pb: 5 }}>
        {/* Warning if there are unsubmitted observations */}
        {hasUnsubmittedObservations && (
          <Alert severity="warning" sx={{ mb: 3, bgcolor: '#fff3cd', borderRadius: 3, border: 'none' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#856404', mb: 0.5 }}>
              Not Submitted to Platform
            </Typography>
            <Typography variant="body2" sx={{ color: '#856404' }}>
              This report contains observations that have not been reported in Platform. Select and submit them below.
            </Typography>
          </Alert>
        )}

        <Card sx={{ mb: 3, borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Building2 size={18} style={{ marginRight: 12, color: '#5F6368' }} />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>{report.vehicleName}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Calendar size={16} style={{ marginRight: 8, color: '#5F6368' }} />
                <Typography variant="body2" color="text.secondary">
                  {new Date(report.date).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Clock size={16} style={{ marginRight: 8, color: '#5F6368' }} />
                <Typography variant="body2" color="text.secondary">
                  {new Date(report.date).toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-around', pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ mb: 0.5 }}>{report.observationsCount}</Typography>
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

        {/* Pakistani Vehicle Verification Data (if available) */}
        {report.vehicleData?.pakistanVerification && (
          <Card sx={{ boxShadow: 2, mb: 3, border: '2px solid #4CAF50', borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#4CAF50' }}>
                  Vehicle Verification
                </Typography>
                <Chip 
                  icon={<CheckCircle2 size={16} />}
                  label="Verified" 
                  size="small" 
                  sx={{ bgcolor: '#d4edda', color: '#155724', fontWeight: 600 }}
                />
              </Box>
              
              <Alert severity="success" sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Vehicle verified with Pakistan Excise & Taxation Department
                </Typography>
              </Alert>

              {/* Table-like layout */}
              <Box sx={{ 
                border: '1px solid #e0e0e0',
                overflow: 'hidden'
              }}>
                {/* Registration No - Highlighted */}
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: '40% 60%',
                  borderBottom: '1px solid #e0e0e0',
                  bgcolor: '#f3e5f5'
                }}>
                  <Box sx={{ p: 1.5, borderRight: '1px solid #e0e0e0' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      Registration No
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5 }}>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#9C27B0' }}>
                      {report.vehicleData.pakistanVerification.registrationNo}
                    </Typography>
                  </Box>
                </Box>

                {/* Make */}
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: '40% 60%',
                  borderBottom: '1px solid #e0e0e0',
                  bgcolor: '#fff'
                }}>
                  <Box sx={{ p: 1.5, borderRight: '1px solid #e0e0e0' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      Make
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {report.vehicleData.pakistanVerification.make}
                    </Typography>
                  </Box>
                </Box>

                {/* Vehicle Model */}
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: '40% 60%',
                  borderBottom: '1px solid #e0e0e0',
                  bgcolor: '#f9f9f9'
                }}>
                  <Box sx={{ p: 1.5, borderRight: '1px solid #e0e0e0' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      Vehicle Model
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {report.vehicleData.pakistanVerification.vehicleModel}
                    </Typography>
                  </Box>
                </Box>

                {/* Model Year */}
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: '40% 60%',
                  borderBottom: '1px solid #e0e0e0',
                  bgcolor: '#fff'
                }}>
                  <Box sx={{ p: 1.5, borderRight: '1px solid #e0e0e0' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      Model Year
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {report.vehicleData.pakistanVerification.modelYear}
                    </Typography>
                  </Box>
                </Box>

                {/* Body Type */}
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: '40% 60%',
                  borderBottom: '1px solid #e0e0e0',
                  bgcolor: '#f9f9f9'
                }}>
                  <Box sx={{ p: 1.5, borderRight: '1px solid #e0e0e0' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      Body Type
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {report.vehicleData.pakistanVerification.bodyType}
                    </Typography>
                  </Box>
                </Box>

                {/* Engine No */}
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: '40% 60%',
                  borderBottom: '1px solid #e0e0e0',
                  bgcolor: '#fff'
                }}>
                  <Box sx={{ p: 1.5, borderRight: '1px solid #e0e0e0' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      Engine No
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {report.vehicleData.pakistanVerification.engineNo}
                    </Typography>
                  </Box>
                </Box>

                {/* Owner Name */}
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: '40% 60%',
                  borderBottom: '1px solid #e0e0e0',
                  bgcolor: '#f9f9f9'
                }}>
                  <Box sx={{ p: 1.5, borderRight: '1px solid #e0e0e0' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      Owner Name
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {report.vehicleData.pakistanVerification.ownerName}
                    </Typography>
                  </Box>
                </Box>

                {/* Registration Date */}
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: '40% 60%',
                  borderBottom: '1px solid #e0e0e0',
                  bgcolor: '#fff'
                }}>
                  <Box sx={{ p: 1.5, borderRight: '1px solid #e0e0e0' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      Registration Date
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {report.vehicleData.pakistanVerification.registrationDate}
                    </Typography>
                  </Box>
                </Box>

                {/* Tax Payment */}
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: '40% 60%',
                  borderBottom: '1px solid #e0e0e0',
                  bgcolor: '#f9f9f9'
                }}>
                  <Box sx={{ p: 1.5, borderRight: '1px solid #e0e0e0' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      Tax Payment
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {report.vehicleData.pakistanVerification.taxPayment}
                    </Typography>
                  </Box>
                </Box>

                {/* Seating Capacity */}
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: '40% 60%',
                  borderBottom: '1px solid #e0e0e0',
                  bgcolor: '#fff'
                }}>
                  <Box sx={{ p: 1.5, borderRight: '1px solid #e0e0e0' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      Seating Capacity
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {report.vehicleData.pakistanVerification.seatingCapacity}
                    </Typography>
                  </Box>
                </Box>

                {/* Horse Power */}
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: '40% 60%',
                  borderBottom: '1px solid #e0e0e0',
                  bgcolor: '#f9f9f9'
                }}>
                  <Box sx={{ p: 1.5, borderRight: '1px solid #e0e0e0' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      Horse Power
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {report.vehicleData.pakistanVerification.horsePower}
                    </Typography>
                  </Box>
                </Box>

                {/* Class of Vehicle */}
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: '40% 60%',
                  borderBottom: '1px solid #e0e0e0',
                  bgcolor: '#fff'
                }}>
                  <Box sx={{ p: 1.5, borderRight: '1px solid #e0e0e0' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      Class of Vehicle
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {report.vehicleData.pakistanVerification.classOfVehicle}
                    </Typography>
                  </Box>
                </Box>

                {/* CPLC Status - Highlighted in green */}
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: '40% 60%',
                  borderBottom: '1px solid #4CAF50',
                  bgcolor: '#d4edda'
                }}>
                  <Box sx={{ p: 1.5, borderRight: '1px solid #4CAF50' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#155724' }}>
                      CPLC Status
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5 }}>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#155724' }}>
                      {report.vehicleData.pakistanVerification.cplc}
                    </Typography>
                  </Box>
                </Box>

                {/* Safe Custody - Highlighted in green */}
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: '40% 60%',
                  bgcolor: '#d4edda'
                }}>
                  <Box sx={{ p: 1.5, borderRight: '1px solid #4CAF50' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#155724' }}>
                      Safe Custody
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5 }}>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#155724' }}>
                      {report.vehicleData.pakistanVerification.safeCustody}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Observation Selection Section */}
        {hasUnsubmittedObservations && (
          <>
            <Card sx={{ mb: 3, bgcolor: '#d1ecf1', borderRadius: 3, border: 'none' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <CheckSquare size={20} style={{ color: '#0c5460', marginTop: 2, flexShrink: 0 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0c5460', mb: 0.5 }}>
                      Select Observations for Platform
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#0c5460' }}>
                      Choose which observations you want to submit to Platform. Already submitted observations are marked with a checkmark.
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
              <Button 
                variant="contained" 
                size="small"
                onClick={handleSelectAll}
              >
                Select all
              </Button>
              <Button 
                variant="outlined" 
                size="small"
                onClick={handleDeselectAll}
                sx={{ bgcolor: 'background.paper', color: 'text.secondary', borderColor: 'divider' }}
              >
                Deselect all
              </Button>
              <Box sx={{ ml: 'auto' }}>
                <Chip 
                  label={`${selectedObservations.size} of ${unsubmittedObservations.length} selected`}
                  sx={{ bgcolor: '#9C27B0', color: '#fff', fontWeight: 500 }}
                />
              </Box>
            </Box>
          </>
        )}

        {/* All Observations */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 3, fontWeight: 600 }}>
            All Observations ({report.observations?.length || 0})
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {report.observations?.map((observation: any) => {
              const isSubmitted = submittedIds.includes(observation.id);
              const isSelected = selectedObservations.has(observation.id);
              
              return (
                <Card key={observation.id} sx={{ borderRadius: 3 }}>
                  {observation.photo && (
                    <Box sx={{ overflow: 'hidden', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
                      <img
                        src={observation.photo}
                        alt={observation.title}
                        style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }}
                      />
                    </Box>
                  )}
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{observation.title}</Typography>
                      <Chip 
                        label={observation.isObservation ? 'No Action Required' : 'Requires Attention'} 
                        size="small"
                        color={observation.isObservation ? 'success' : 'warning'}
                        sx={{ fontSize: '0.65rem', height: 20 }}
                      />
                    </Box>
                    
                    <Typography variant="body2" sx={{ mb: 3 }}>{observation.description}</Typography>
                    
                    {isSubmitted ? (
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', color: '#28a745', mb: 1 }}>
                          <Check size={16} style={{ marginRight: 4 }} />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            Submitted to Platform
                          </Typography>
                        </Box>
                        {observation.platformReference && (
                          <Box sx={{ 
                            mt: 2, 
                            p: 2, 
                            bgcolor: '#f5f5f5', 
                            border: '1px solid #e0e0e0',
                            borderRadius: 2
                          }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                              Platform issue:
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.primary', letterSpacing: 0.5 }}>
                              {observation.platformReference}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    ) : (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={isSelected}
                            onChange={() => handleToggleObservation(observation.id)}
                          />
                        }
                        label="Raise this observation in Platform"
                      />
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Box>

        {/* Submit Button */}
        {hasUnsubmittedObservations && selectedObservations.size > 0 && (
          <Button 
            onClick={handleSubmitToPlatform} 
            variant="contained"
            fullWidth
            sx={{ 
              mb: 3,
              py: 2,
              fontWeight: 600
            }}
          >
            Submit to Platform ({selectedObservations.size})
          </Button>
        )}

        {/* View in Platform if any observations submitted */}
        {submittedIds.length > 0 && report.platformLink && (
          <Button 
            onClick={handleOpenPlatform} 
            variant="outlined"
            fullWidth
            sx={{ mb: 2, py: 2, fontWeight: 600 }}
          >
            <ExternalLink size={20} style={{ marginRight: 8 }} />
            View in Platform
          </Button>
        )}

        {/* Share and Export Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleShareInspection}
            sx={{ py: 2, fontWeight: 600 }}
          >
            <Share2 size={20} style={{ marginRight: 8 }} />
            Share inspection
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleExportPDF}
            sx={{ py: 2, fontWeight: 600 }}
          >
            <FileDown size={20} style={{ marginRight: 8 }} />
            Export PDF
          </Button>
        </Box>

        <Button
          variant="outlined"
          color="error"
          fullWidth
          onClick={() => setShowDeleteDrawer(true)}
          sx={{ mb: 3, py: 2, fontWeight: 600 }}
        >
          <Trash2 size={20} style={{ marginRight: 8 }} />
          Delete report
        </Button>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Track maintenance requests and updates in Platform
          </Typography>
        </Box>
      </Container>

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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button 
              variant="contained" 
              color="error" 
              fullWidth 
              onClick={handleDeleteReport}
              sx={{ py: 1.5, fontWeight: 500 }}
            >
              Delete report
            </Button>
            <Button 
              variant="outlined" 
              fullWidth 
              onClick={() => setShowDeleteDrawer(false)}
              sx={{ py: 1.5, fontWeight: 500 }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
}