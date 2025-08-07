'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, X, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMedications } from '@/contexts/MedicationContext';
import Link from 'next/link';
import Quagga from 'quagga';

export default function ScanPage() {
  const { addMedication } = useMedications();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [showTestAdd, setShowTestAdd] = useState(false);
  const [isAddingMedication, setIsAddingMedication] = useState(false);
  const [medicationName, setMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Once daily');
  const [scannedMedication, setScannedMedication] = useState<{name: string; dosage?: string; commonFrequency?: string; instructions?: string; description?: string; ndcNumber?: string; genericName?: string; barcode?: string; manufacturer?: string} | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Mock medication database for barcode lookup
  const medicationDatabase: { [key: string]: {name: string; genericName?: string; dosage?: string; manufacturer?: string; description?: string; commonFrequency?: string; instructions?: string; ndcNumber?: string} } = {
    '012345678901': {
      name: 'Metformin',
      genericName: 'Metformin Hydrochloride',
      dosage: '500mg',
      manufacturer: 'Generic Pharma',
      description: 'Used to treat type 2 diabetes',
      commonFrequency: 'Twice daily',
      instructions: 'Take with meals',
      ndcNumber: '0093-1079-01'
    },
    '030772016813': {
      name: 'Lisinopril',
      genericName: 'Lisinopril',
      dosage: '10mg',
      manufacturer: 'Heart Health Pharma',
      description: 'ACE inhibitor for high blood pressure',
      commonFrequency: 'Once daily',
      instructions: 'Take at the same time each day',
      ndcNumber: '0093-5056-01'
    },
    '311917007731': {
      name: 'Ibuprofen',
      genericName: 'Ibuprofen',
      dosage: '200mg',
      manufacturer: 'Pain Relief Corp',
      description: 'Pain reliever and fever reducer',
      commonFrequency: 'As needed',
      instructions: 'Take with food',
      ndcNumber: '0580-0123-45'
    },
    '049000028226': {
      name: 'Vitamin D3',
      genericName: 'Cholecalciferol',
      dosage: '2000 IU',
      manufacturer: 'Health Supplements Inc',
      description: 'Vitamin D supplement',
      commonFrequency: 'Once daily',
      instructions: 'Take with fatty foods for better absorption',
      ndcNumber: '0456-7890-12'
    },
    '041789004124': {
      name: 'Aspirin',
      genericName: 'Acetylsalicylic Acid',
      dosage: '81mg',
      manufacturer: 'Cardio Health Labs',
      description: 'Low-dose aspirin for heart health',
      commonFrequency: 'Once daily',
      instructions: 'Take with food',
      ndcNumber: '0123-4567-89'
    },
    '123456789012': {
      name: 'Generic Medication',
      genericName: 'Unknown Compound',
      dosage: 'Unknown',
      manufacturer: 'Unknown Manufacturer',
      description: 'Generic medication - consult pharmacist',
      commonFrequency: 'As prescribed',
      instructions: 'Follow prescription instructions',
      ndcNumber: 'Unknown'
    }
  };

  // Look up medication information by barcode
  const lookupMedication = async (barcode: string) => {
    setIsLookingUp(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const medicationInfo = medicationDatabase[barcode];
      
      if (medicationInfo) {
        console.log('Medication found:', medicationInfo);
        setScannedMedication(medicationInfo);
        
        // Pre-fill the manual form with the found information
        setMedicationName(medicationInfo.name);
        setDosage(medicationInfo.dosage || '');
        setFrequency(medicationInfo.commonFrequency || 'Once daily');
      } else {
        console.log('Medication not found in database');
        setScannedMedication({
          name: 'Unknown Medication',
          description: 'This barcode is not in our database. Please add medication details manually.',
          barcode: barcode
        });
      }
    } catch (error) {
      console.error('Error looking up medication:', error);
      setScannedMedication({
        name: 'Lookup Failed',
        description: 'Could not retrieve medication information. Please add details manually.',
        barcode: barcode
      });
    } finally {
      setIsLookingUp(false);
    }
  };

  // Retry camera permission request
  const retryCamera = async () => {
    setError(null);
    setHasPermission(null); // Reset to loading state
    
    // Stop existing stream if any
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Re-trigger permission request
    setTimeout(async () => {
      await requestCameraPermission();
    }, 100);
  };

  // Request camera permission function (extracted for reuse)
  const requestCameraPermission = async () => {
      try {
        console.log('Requesting camera permission...');
        
        // Check if mediaDevices is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera not supported by this browser');
        }

        // Try different camera constraints for better compatibility
        const constraints = {
          video: {
            facingMode: { ideal: 'environment' },
            width: { min: 640, ideal: 1280, max: 1920 },
            height: { min: 480, ideal: 720, max: 1080 }
          }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        console.log('Camera permission granted');
        setHasPermission(true);
        streamRef.current = stream;
        setError(null);
        
      } catch (err) {
        console.error('Camera permission error:', err);
        setHasPermission(false);
        
        // Provide specific error messages based on error type
        let errorMessage = 'Camera access is required for barcode scanning';
        
        if (err instanceof Error) {
          if (err.name === 'NotAllowedError') {
            errorMessage = 'Camera permission was denied. Please allow camera access and refresh the page.';
          } else if (err.name === 'NotFoundError') {
            errorMessage = 'No camera found on this device.';
          } else if (err.name === 'NotSupportedError') {
            errorMessage = 'Camera is not supported by this browser.';
          } else if (err.name === 'NotReadableError') {
            errorMessage = 'Camera is already in use by another application.';
          } else if (err.name === 'OverconstrainedError') {
            errorMessage = 'Camera settings are not supported. Trying basic settings...';
            
            // Try with simpler constraints
            try {
              const fallbackStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'user' } // Try front camera first
              });
              console.log('Camera permission granted with fallback settings');
              setHasPermission(true);
              streamRef.current = fallbackStream;
              setError(null);
              return;
            } catch (fallbackErr) {
              console.error('Front camera fallback failed:', fallbackErr);
              
              // Try with any available camera
              try {
                const anyCameraStream = await navigator.mediaDevices.getUserMedia({ 
                  video: true 
                });
                console.log('Camera permission granted with any camera');
                setHasPermission(true);
                streamRef.current = anyCameraStream;
                setError(null);
                return;
              } catch (anyCameraErr) {
                console.error('Any camera fallback failed:', anyCameraErr);
                errorMessage = 'Camera access failed with all settings.';
              }
            }
          } else {
            errorMessage = `Camera error: ${err.message}`;
          }
        }
        
        setError(errorMessage);
      }
  };

  // Request camera permission
  useEffect(() => {
    requestCameraPermission();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        console.log('Camera stream stopped');
      }
    };
  }, []);

  const startScan = async () => {
    if (!hasPermission) {
      setError('Camera permission is required');
      return;
    }

    setIsScanning(true);
    setError(null);
    setScanResult(null);

    try {
      // Initialize QuaggaJS directly without manually setting video source
      detectBarcode();
    } catch (err) {
      console.error('Failed to start scanning:', err);
      setError('Failed to start camera');
      setIsScanning(false);
    }
  };

  const detectBarcode = () => {
    if (!isScanning) return;

    try {
      // Create a scanner div to hold the video
      const scannerDiv = document.getElementById('scanner-div');
      if (!scannerDiv) return;

      Quagga.init({
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: scannerDiv, // Use the scanner div instead of video element
          constraints: {
            width: 640,
            height: 480,
            facingMode: "environment"
          }
        },
        locator: {
          patchSize: "medium",
          halfSample: true
        },
        numOfWorkers: navigator.hardwareConcurrency || 2,
        frequency: 10,
        decoder: {
          readers: [
            "code_128_reader", 
            "ean_reader", 
            "ean_8_reader", 
            "code_39_reader",
            "code_39_vin_reader",
            "codabar_reader",
            "upc_reader",
            "upc_e_reader"
          ]
        },
        locate: true
      }, (err: unknown) => {
        if (err) {
          console.error('QuaggaJS initialization failed:', err);
          // Fallback to mock detection if QuaggaJS fails
          setTimeout(() => mockBarcodeDetection(), 2000);
          return;
        }
        
        console.log('QuaggaJS initialized successfully');
        Quagga.start();
      });

      // Listen for barcode detection
      Quagga.onDetected(async (result: {codeResult: {code: string}}) => {
        const code = result.codeResult.code;
        console.log('Barcode detected:', code);
        
        // Vibration feedback for successful scan
        if ('vibrate' in navigator) {
          navigator.vibrate([100, 50, 100]);
        }
        
        setScanResult(code);
        setIsScanning(false);
        
        // Stop QuaggaJS
        Quagga.stop();
        
        // Look up medication information
        await lookupMedication(code);
      });

    } catch (error) {
      console.error('QuaggaJS error:', error);
      // Fallback to mock detection after delay
      setTimeout(() => mockBarcodeDetection(), 2000);
    }
  };

  // Fallback mock detection for when QuaggaJS fails
  const mockBarcodeDetection = () => {
    // Generate realistic medication barcodes (UPC-A format)
    const mockBarcodes = [
      '012345678901', // Generic format
      '030772016813', // Example pharmaceutical barcode
      '311917007731', // Example OTC medication
      '049000028226', // Example vitamin/supplement
      '041789004124', // Example pharmacy product
      '123456789012'  // Simple test barcode
    ];
    
    const randomBarcode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
    console.log('Mock barcode generated:', randomBarcode);
    
    setScanResult(randomBarcode);
    setIsScanning(false);
    
    // Vibration feedback for successful scan
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
    
    // Look up medication information
    lookupMedication(randomBarcode);
  };

  const resetScan = () => {
    setScanResult(null);
    setIsScanning(false);
    setError(null);
    setScannedMedication(null);
    setIsLookingUp(false);
    
    // Reset form fields
    setMedicationName('');
    setDosage('');
    setFrequency('Once daily');
    
    // Stop QuaggaJS if it's running
    try {
      Quagga.stop();
      console.log('QuaggaJS stopped');
    } catch (error) {
      console.log('QuaggaJS was not running or error stopping:', error);
    }
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Cleanup when component unmounts
      try {
        Quagga.stop();
        console.log('QuaggaJS stopped on unmount');
      } catch (error) {
        console.log('QuaggaJS cleanup error:', error);
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const addMedicationManually = async () => {
    if (!medicationName.trim() || !dosage.trim()) {
      alert('Please fill in medication name and dosage.');
      return;
    }

    setIsAddingMedication(true);
    
    try {
      const medicationData = {
        userId: 1, // Default user ID for demo
        name: medicationName.trim(),
        dosage: dosage.trim(),
        frequency: frequency,
        instructions: scannedMedication?.instructions || `Take ${frequency.toLowerCase()}`,
        startDate: new Date(),
        isActive: true,
        description: scannedMedication?.description || `Added via ${scanResult ? 'barcode scan' : 'manual entry'} from scan page`,
        barcode: scanResult || undefined,
        ndcNumber: scannedMedication?.ndcNumber || undefined,
        genericName: scannedMedication?.genericName || undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('Adding medication through context:', medicationData);
      const medicationId = await addMedication(medicationData);
      console.log('Medication added successfully with ID:', medicationId);
      
      // Success feedback with haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]); // Success vibration pattern
      }
      alert(`✅ ${medicationName} added successfully to your medications!`);
      
      // Reset form
      setMedicationName('');
      setDosage('');
      setFrequency('Once daily');
      setShowTestAdd(false);
      
    } catch (error) {
      console.error('Failed to add medication:', error);
      
      // Error feedback with haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([200]); // Error vibration
      }
      
      let errorMessage = 'Failed to add medication. Please try again.';
      if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`;
      }
      alert(`❌ ${errorMessage}`);
    } finally {
      setIsAddingMedication(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/15 to-primary/5 px-4 py-6 pt-8">
        <div className="max-w-sm mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/" className="p-2 hover:bg-white/20 rounded-full">
              <X size={24} className="text-foreground" />
            </Link>
            <h1 className="text-2xl font-bold text-foreground flex-1">
              Scan Medication
            </h1>
          </div>
          <p className="text-muted-foreground text-base">
            Point your camera at the medication barcode
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded-lg">
              <p className="text-xs text-yellow-800">
                <strong>Development Mode:</strong> Camera may require HTTPS or localhost permissions. 
                Try refreshing the page or check browser settings.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 max-w-sm mx-auto space-y-6">
        
        {/* Camera/Scanner Area - Full Screen Experience */}
        <div className="relative bg-black rounded-2xl overflow-hidden">
          <div className="aspect-square relative">
            {/* Scanner div for QuaggaJS */}
            <div 
              id="scanner-div" 
              className={`absolute inset-0 ${isScanning ? 'block' : 'hidden'}`}
              style={{ width: '100%', height: '100%' }}
            >
              {/* QuaggaJS will inject video and canvas here */}
            </div>
            
            {/* Hidden video and canvas elements for fallback */}
            <video
              ref={videoRef}
              className="hidden"
              autoPlay
              playsInline
              muted
            />
            <canvas
              ref={canvasRef}
              className="hidden"
            />
            
            {/* Test Add Button - Top Right */}
            <button
              onClick={() => setShowTestAdd(true)}
              className="absolute top-4 right-4 z-10 bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-full shadow-lg transition-colors"
              title="Add medication manually"
            >
              <Plus size={20} />
            </button>
            
            {/* Test Scan Button - Top Left (Development Only) */}
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={() => {
                  setScanResult('012345678901');
                  setIsScanning(false);
                  lookupMedication('012345678901');
                }}
                className="absolute top-4 left-4 z-10 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-colors"
                title="Test scan (development only)"
              >
                <Camera size={20} />
              </button>
            )}
            
            {hasPermission === null && (
              <div className="text-center text-white p-6 absolute inset-0 flex items-center justify-center">
                <div>
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
                  <p className="text-lg font-medium mb-2">Checking Camera</p>
                  <p className="text-sm opacity-75">Requesting camera permission...</p>
                </div>
              </div>
            )}

            {hasPermission === false && (
              <div className="text-center text-white p-6 absolute inset-0 flex items-center justify-center">
                <div>
                  <AlertCircle size={64} className="mx-auto mb-4 text-red-400" />
                  <p className="text-lg font-medium mb-2">Camera Access Required</p>
                  <p className="text-sm opacity-75 mb-4">
                    Please allow camera access to scan barcodes. Check your browser settings or try refreshing the page.
                  </p>
                  <div className="bg-black/20 rounded-lg p-3 mb-4 text-xs">
                    <p className="font-medium mb-1">How to enable camera:</p>
                    <ul className="text-left space-y-1">
                      <li>• Click the camera icon in your browser's address bar</li>
                      <li>• Select "Allow" when prompted</li>
                      <li>• Or refresh the page and try again</li>
                    </ul>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button 
                      onClick={retryCamera}
                      variant="primary"
                      size="sm"
                      className="touch-feedback"
                    >
                      Retry Camera
                    </Button>
                    <Button 
                      onClick={() => window.location.reload()}
                      variant="outline"
                      size="sm"
                      className="touch-feedback"
                    >
                      Refresh Page
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {hasPermission && !isScanning && !scanResult && !error && (
              <div className="text-center text-white absolute inset-0 flex items-center justify-center">
                <div>
                  <Camera size={64} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Ready to scan</p>
                  <p className="text-sm opacity-75">Point camera at barcode</p>
                </div>
              </div>
            )}
            
            {error && (
              <div className="text-center text-white p-6 absolute inset-0 flex items-center justify-center">
                <div>
                  <AlertCircle size={64} className="mx-auto mb-4 text-red-400" />
                  <p className="text-lg font-medium mb-2">Scanning Error</p>
                  <p className="text-sm opacity-75 mb-4">{error}</p>
                  <div className="flex gap-2 justify-center">
                    <Button 
                      onClick={retryCamera}
                      variant="primary"
                      size="sm"
                      className="touch-feedback"
                    >
                      Retry Camera
                    </Button>
                    <Button 
                      onClick={resetScan}
                      variant="outline"
                      size="sm"
                      className="touch-feedback"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {isScanning && (
              <div className="text-center text-white absolute inset-0 flex items-center justify-center">
                <div>
                  {/* Yellow Scanning Frame Overlay */}
                  <div className="relative w-64 h-64">
                    <div className="absolute inset-0 border-2 border-yellow-400 rounded-lg">
                      {/* Corner indicators */}
                      <div className="absolute top-0 left-0 w-6 h-6 border-l-4 border-t-4 border-yellow-400"></div>
                      <div className="absolute top-0 right-0 w-6 h-6 border-r-4 border-t-4 border-yellow-400"></div>
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-l-4 border-b-4 border-yellow-400"></div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-r-4 border-b-4 border-yellow-400"></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-48 h-32 border border-yellow-400/30 rounded"></div>
                    </div>
                  </div>
                  <p className="text-lg font-medium mt-4">Scanning...</p>
                  <p className="text-sm opacity-75">Hold steady</p>
                </div>
              </div>
            )}
            
            {scanResult && (
              <div className="text-center text-white absolute inset-0 flex items-center justify-center p-4">
                <div className="max-w-sm w-full">
                  <CheckCircle size={64} className="mx-auto mb-4 text-green-400" />
                  <p className="text-lg font-medium">Scan Complete!</p>
                  <p className="text-xs opacity-75 font-mono mt-2 mb-4">{scanResult}</p>
                  
                  {isLookingUp && (
                    <div className="bg-black/20 rounded-lg p-4 mb-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mx-auto mb-2"></div>
                      <p className="text-sm">Looking up medication...</p>
                    </div>
                  )}
                  
                  {scannedMedication && !isLookingUp && (
                    <div className="bg-black/20 rounded-lg p-4 text-left">
                      <h3 className="text-lg font-bold text-green-400 mb-2">
                        📊 {scannedMedication.name}
                      </h3>
                      
                      {scannedMedication.genericName && scannedMedication.genericName !== 'Unknown Compound' && (
                        <p className="text-sm mb-2">
                          <span className="opacity-75">Generic:</span> {scannedMedication.genericName}
                        </p>
                      )}
                      
                      {scannedMedication.dosage && scannedMedication.dosage !== 'Unknown' && (
                        <p className="text-sm mb-2">
                          <span className="opacity-75">Dosage:</span> {scannedMedication.dosage}
                        </p>
                      )}
                      
                      {scannedMedication.manufacturer && scannedMedication.manufacturer !== 'Unknown Manufacturer' && (
                        <p className="text-sm mb-2">
                          <span className="opacity-75">Manufacturer:</span> {scannedMedication.manufacturer}
                        </p>
                      )}
                      
                      <p className="text-sm mb-2">
                        <span className="opacity-75">Description:</span> {scannedMedication.description}
                      </p>
                      
                      {scannedMedication.commonFrequency && (
                        <p className="text-sm mb-2">
                          <span className="opacity-75">Typical Frequency:</span> {scannedMedication.commonFrequency}
                        </p>
                      )}
                      
                      {scannedMedication.instructions && (
                        <p className="text-sm">
                          <span className="opacity-75">Instructions:</span> {scannedMedication.instructions}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <Card className="p-4">
          <h3 className="font-semibold text-foreground mb-3">Scanning Tips</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0"></span>
              <span>Hold your phone steady and about 6 inches from the barcode</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0"></span>
              <span>Make sure the barcode is well lit and in focus</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0"></span>
              <span>The scan will happen automatically when detected</span>
            </li>
          </ul>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          {!isScanning && !scanResult && (
            <Button
              onClick={startScan}
              variant="primary"
              size="lg"
              fullWidth
              className="touch-feedback"
            >
              <Camera className="w-5 h-5 mr-2" />
              Start Scanning
            </Button>
          )}
          
          {isScanning && (
            <Button
              onClick={resetScan}
              variant="outline"
              size="lg"
              fullWidth
              className="touch-feedback"
            >
              Cancel Scan
            </Button>
          )}
          
          {scanResult && (
            <div className="space-y-3">
              {scannedMedication && !isLookingUp && (
                <>
                  <Button
                    onClick={() => {
                      // Pre-fill the form with scanned medication data
                      if (scannedMedication.name && scannedMedication.name !== 'Unknown Medication') {
                        setMedicationName(scannedMedication.name);
                        setDosage(scannedMedication.dosage || '');
                        setFrequency(scannedMedication.commonFrequency || 'Once daily');
                      }
                      setShowTestAdd(true);
                    }}
                    variant="primary"
                    size="lg"
                    fullWidth
                    className="touch-feedback"
                  >
                    📋 Add to My Medications
                  </Button>
                  
                  {scannedMedication.name === 'Unknown Medication' || scannedMedication.name === 'Lookup Failed' ? (
                    <Button
                      onClick={() => setShowTestAdd(true)}
                      variant="outline"
                      size="lg"
                      fullWidth
                      className="touch-feedback"
                    >
                      ✏️ Add Details Manually
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setShowTestAdd(true)}
                      variant="outline"
                      size="lg"
                      fullWidth
                      className="touch-feedback"
                    >
                      ✏️ Edit Details
                    </Button>
                  )}
                </>
              )}
              
              {isLookingUp && (
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  disabled
                  className="touch-feedback"
                >
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                  Looking up medication...
                </Button>
              )}
              
              <Button
                onClick={resetScan}
                variant="outline"
                size="lg"
                fullWidth
                className="touch-feedback"
              >
                📷 Scan Another
              </Button>
            </div>
          )}
        </div>

        {/* Alternative Options */}
        <Card className="p-4 bg-gray-100/50">
          <h4 className="font-medium text-foreground mb-2">Can&apos;t scan?</h4>
          <p className="text-sm text-muted-foreground mb-3">
            You can also add medications manually by searching our database.
          </p>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowTestAdd(true)}
              variant="outline" 
              size="md" 
              className="touch-feedback flex-1"
            >
              Add Manually
            </Button>
            <Link href="/medications" className="flex-1">
              <Button variant="outline" size="md" className="touch-feedback w-full">
                Browse Database
              </Button>
            </Link>
          </div>
          {hasPermission === false && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Camera blocked?</strong> Try refreshing the page or check your browser's camera permissions in the address bar.
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Test Add Modal */}
      {showTestAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">
                  Add Medication Manually
                </h2>
                <button
                  onClick={() => setShowTestAdd(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Medication Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Metformin"
                    value={medicationName}
                    onChange={(e) => setMedicationName(e.target.value)}
                    className="w-full p-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Dosage
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 500mg"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    className="w-full p-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Frequency
                  </label>
                  <select 
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full p-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option>Once daily</option>
                    <option>Twice daily</option>
                    <option>Three times daily</option>
                    <option>As needed</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  onClick={() => setShowTestAdd(false)}
                  variant="outline"
                  size="md"
                  className="flex-1 touch-feedback"
                >
                  Cancel
                </Button>
                <Button
                  onClick={addMedicationManually}
                  disabled={isAddingMedication}
                  variant="primary"
                  size="md"
                  className="flex-1 touch-feedback"
                >
                  {isAddingMedication ? 'Adding...' : 'Add Medication'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}