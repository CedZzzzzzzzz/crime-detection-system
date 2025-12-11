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

  const processImage = async (imageData) => {
    setIsProcessing(true);
    setDetectionResult(null);
    setPreviewImage(imageData);
    
    try {
      // ⚠️ TODO: Replace with your actual ML API endpoint
      // const response = await fetch('http://localhost:5000/api/detect', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ image: imageData })
      // });
      
      // if (!response.ok) throw new Error('Detection failed');
      // const result = await response.json();
      // setDetectionResult(result);
      
      // ✅ MOCK DATA - Remove this when you integrate your ML model
      setTimeout(() => {
        const mockResult = {
          detected: Math.random() > 0.5,
          objectType: ['gun', 'knife', 'weapon'][Math.floor(Math.random() * 3)],
          confidence: (Math.random() * 30 + 70).toFixed(2),
          timestamp: new Date().toLocaleString()
        };
        setDetectionResult(mockResult);
        setIsProcessing(false);
      }, 2000);
      
    } catch (error) {
      console.error('Detection error:', error);
      alert('Error processing image. Make sure your backend is running.');
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

        {/* Integration Info */}
        <div className="info-panel">
          <h3>🔌 ML Model Integration</h3>
          <p>To connect your machine learning model, update the API endpoint in <code>src/App.js</code> (line 19-26):</p>
          <pre>
{`const response = await fetch('YOUR_ML_API_ENDPOINT', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ image: imageData })
});
const result = await response.json();`}
          </pre>
          <p style={{ marginTop: 12 }}>Expected response format:</p>
          <pre>
{`{
  "detected": true,
  "objectType": "gun",
  "confidence": 87.5,
  "timestamp": "2024-12-04 10:30:00"
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default App;