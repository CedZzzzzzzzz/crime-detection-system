import React, { useRef, useEffect, useState } from 'react';
import { Camera } from 'lucide-react';

function CameraCapture({ onCapture, isProcessing }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setError(null);
    } catch (err) {
      console.error('Camera access denied:', err);
      setError('Unable to access camera. Please grant camera permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to base64 image
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    onCapture(imageData);
  };

  return (
    <div>
      <h2>
        <Camera style={{ width: 20, height: 20, color: '#ef4444' }} />
        Camera Feed
      </h2>
      
      <div className="video-container">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted
        />
        {!stream && !error && (
          <div className="video-placeholder">
            <p>Starting camera...</p>
          </div>
        )}
        {error && (
          <div className="video-placeholder">
            <p style={{ color: '#ef4444' }}>{error}</p>
            <button 
              onClick={startCamera}
              style={{ 
                marginTop: 12, 
                padding: '8px 16px', 
                background: '#dc2626',
                border: 'none',
                borderRadius: 4,
                color: 'white',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        )}
      </div>
      
      <button
        onClick={captureImage}
        disabled={!stream || isProcessing}
        className="btn btn-primary"
      >
        <Camera style={{ width: 20, height: 20 }} />
        {isProcessing ? 'Processing...' : 'Capture & Analyze'}
      </button>
      
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

export default CameraCapture;