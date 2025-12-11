import React, { useState } from 'react';
import { AlertTriangle, Camera, Upload } from 'lucide-react';
import CameraCapture from './components/CameraCapture';
import ImageUpload from './components/ImageUpload';
import DetectionResults from './components/DetectionResults';

function App() {
  const [activeTab, setActiveTab] = useState('camera');
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const API_URL = "https://yolo-backend-mhrm.onrender.com/detect"; 

  const processImage = async (imageData) => {
    setIsProcessing(true);
    setDetectionResult(null);
    setPreviewImage(imageData);
    
    try {
      const blob = await (await fetch(imageData)).blob();
      const formData = new FormData();
      formData.append('image', blob, 'capture.jpg');

      // 2. Send to your Live Backend
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData, 
      });
      
      if (!response.ok) throw new Error('Detection failed');
      
      const result = await response.json();
      setDetectionResult(result);
      
    } catch (error) {
      console.error('Detection error:', error);
      alert('Error connecting to server. Please check your internet connection or if the backend is waking up (it takes 50s on free tier).');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetDetection = () => {
    setDetectionResult(null);
    setPreviewImage(null);
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <AlertTriangle className="header-icon" />
            <div>
              <h1>Detective Co-Ai-Nan</h1>
              <p className="header-subtitle">Real-time weapon & threat detection</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container main-content">
        {/* Tab Navigation */}
        <div className="tabs">
          <button
            onClick={() => setActiveTab('camera')}
            className={`tab ${activeTab === 'camera' ? 'active' : ''}`}
          >
            <Camera style={{ width: 20, height: 20 }} />
            Live Camera
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
          >
            <Upload style={{ width: 20, height: 20 }} />
            Upload Image
          </button>
        </div>

        {/* Content Grid */}
        <div className="content-grid">
          {/* Left Panel - Input */}
          <div className="panel">
            {activeTab === 'camera' ? (
              <CameraCapture 
                onCapture={processImage}
                isProcessing={isProcessing}
              />
            ) : (
              <ImageUpload 
                onUpload={processImage}
                isProcessing={isProcessing}
              />
            )}
          </div>

          {/* Right Panel - Results */}
          <div className="panel">
            <DetectionResults
              previewImage={previewImage}
              isProcessing={isProcessing}
              detectionResult={detectionResult}
              onReset={resetDetection}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;