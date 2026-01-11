import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, AlertTriangle, CheckCircle, XCircle, RefreshCw, MessageCircle, Send, Bot, User, X } from 'lucide-react';
import './App.css';

export default function CrimeDetectionApp() {
  // State Management
  const [activeTab, setActiveTab] = useState('camera');
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatProcessing, setIsChatProcessing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
  const [stream, setStream] = useState(null);
  
  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  const BACKEND_URL = 'https://yolo-backend-mhrm.onrender.com';

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (showChat && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, showChat]);

  // Camera Management
  useEffect(() => {
    if (activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [activeTab]);

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
    } catch (err) {
      console.error('Camera access denied:', err);
      alert('Unable to access camera. Please grant permission.');
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
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(blob));
      processImage(file);
    }, 'image/jpeg', 0.8);
  };

  // File Upload Handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }
    
    setImageFile(file);
    setPreviewImage(URL.createObjectURL(file));
    processImage(file);
  };

  // Main Detection Function - Sends image to backend YOLO API
  const processImage = async (file) => {
    setIsProcessing(true);
    setDetectionResult(null);
    setMessages([]);
    
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${BACKEND_URL}/detect`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Detection failed`);
      }
      
      const result = await response.json();
      setDetectionResult(result);
      setShowChat(true);
      
      const welcomeMessage = result.detected
        ? `⚠️ **THREAT DETECTED**\n\nI've analyzed the image and found **${result.total_objects || 1} object(s)**.\n\n**Primary Threat:** ${result.objectType}\n**Confidence:** ${result.confidence}%\n**Threat Level:** ${result.threat_level || 'high'}\n\nThis requires immediate attention. What would you like to know?`
        : `✅ **NO THREATS DETECTED**\n\nI've analyzed the image thoroughly. The scene appears safe.\n\nFeel free to ask me questions!`;
      
      addBotMessage(welcomeMessage);
      
    } catch (error) {
      console.error('Detection error:', error);
      alert(`Error: ${error.message}\n\nMake sure backend is running at: ${BACKEND_URL}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Chat Message Handlers
  const addBotMessage = (text) => {
    setMessages(prev => [...prev, { role: 'assistant', content: text }]);
  };

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, { role: 'user', content: text }]);
  };

  // Chat Function - Sends question to Gemini AI
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !detectionResult) return;
    
    const userMsg = inputMessage;
    setInputMessage('');
    addUserMessage(userMsg);
    setIsChatProcessing(true);

    try {
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMsg,
          detections: detectionResult.all_detections || []
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      addBotMessage(data.reply);
      
    } catch (error) {
      console.error('Chat error:', error);
      addBotMessage("⚠️ I couldn't reach the AI server. Please check your connection.");
    } finally {
      setIsChatProcessing(false);
    }
  };

  const resetDetection = () => {
    setDetectionResult(null);
    setPreviewImage(null);
    setImageFile(null);
    setMessages([]);
    setShowChat(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <AlertTriangle className="header-icon" />
            <div>
              <h1>DETECTIVE CO-AI-NAN</h1>
              <p className="header-subtitle">Real-time weapon & Threat detection</p>
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
            <Camera size={20} /> Live Camera
          </button>
          <button 
            onClick={() => setActiveTab('upload')} 
            className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
          >
            <Upload size={20} /> Upload Image
          </button>
        </div>

        {/* Content Grid */}
        <div className="content-grid">
          {/* Input Panel */}
          <div className="panel">
            <h2>
              {activeTab === 'camera' 
                ? <><Camera size={20} color="#ef4444" /> Camera Feed</> 
                : <><Upload size={20} color="#ef4444" /> Upload Image</>
              }
            </h2>

            {activeTab === 'camera' ? (
              <div>
                <div className="video-container">
                  <video ref={videoRef} autoPlay playsInline muted />
                  {!stream && <div className="video-placeholder">Starting camera...</div>}
                </div>
                <button 
                  onClick={captureImage} 
                  disabled={!stream || isProcessing} 
                  className="btn btn-primary"
                >
                  <Camera size={20} /> 
                  {isProcessing ? 'Processing...' : 'Capture & Analyze'}
                </button>
              </div>
            ) : (
              <div 
                className="upload-area" 
                onClick={() => !isProcessing && fileInputRef.current?.click()}
              >
                <Upload className="upload-icon" />
                <p className="upload-text">
                  {isProcessing ? 'Processing...' : 'Click to upload'}
                </p>
                <p className="upload-subtext">PNG, JPG up to 10MB</p>
                <input 
                  ref={fileInputRef} 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  style={{display:'none'}} 
                  disabled={isProcessing} 
                />
              </div>
            )}
            <canvas ref={canvasRef} style={{display:'none'}} />
          </div>

          {/* Results Panel */}
          <div className="panel">
            <h2>
              <AlertTriangle size={20} color="#ef4444" /> Detection Results
            </h2>

            {!previewImage && !isProcessing && !detectionResult && (
              <div className="empty-state">
                <XCircle className="empty-icon" />
                <p>No analysis yet</p>
                <p style={{fontSize:'14px',marginTop:'8px'}}>
                  Capture or upload an image
                </p>
              </div>
            )}

            {previewImage && (
              <img src={previewImage} alt="Preview" className="preview-image" />
            )}

            {isProcessing && (
              <div className="loading-state">
                <RefreshCw className="spinner" />
                <p style={{fontSize:'18px',fontWeight:'600'}}>Analyzing...</p>
              </div>
            )}

            {detectionResult && (
              <div>
                <div className={`result-card ${detectionResult.detected ? 'threat' : 'safe'}`}>
                  <div className="result-header">
                    {detectionResult.detected 
                      ? <AlertTriangle size={32} color="#ef4444" /> 
                      : <CheckCircle size={32} color="#16a34a" />
                    }
                    <h3>
                      {detectionResult.detected ? 'THREAT DETECTED' : 'NO THREAT'}
                    </h3>
                  </div>

                  {detectionResult.detected && (
                    <div className="result-details">
                      <div className="result-row">
                        <span>Object:</span>
                        <span className="result-value">
                          {detectionResult.objectType}
                        </span>
                      </div>
                      <div className="result-row">
                        <span>Confidence:</span>
                        <span className="result-value">
                          {detectionResult.confidence}%
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{width:`${detectionResult.confidence}%`}} 
                        />
                      </div>
                    </div>
                  )}

                  <div className="result-footer">
                    Objects: {detectionResult.total_objects || 0} • {detectionResult.timestamp}
                  </div>
                </div>

                <div className="button-group">
                  <button 
                    onClick={() => setShowChat(true)} 
                    className="btn btn-primary"
                  >
                    <MessageCircle size={20} /> Ask Questions
                  </button>
                  <button 
                    onClick={resetDetection} 
                    className="btn btn-secondary"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Chat Widget */}
      <div className="chat-widget-wrapper">
        <div className={`chat-window ${showChat ? 'visible' : 'hidden'}`}>
          <div className="chat-panel">
            {/* Chat Header */}
            <div className="chat-header">
              <div className="chat-header-content">
                <Bot size={20} color="#ef4444" /> 
                <span className="chat-title">AI Assistant</span>
                <span className="badge">POWERED BY GEMINI</span>
              </div>
              <button 
                onClick={() => setShowChat(false)} 
                className="close-btn"
                aria-label="Close chat"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="chat-messages">
              {messages.length === 0 && (
                <div className="chat-empty">
                  <Bot size={48} />
                  <p>Ask me anything about the detection!</p>
                </div>
              )}
              
              {messages.map((msg, idx) => (
                <div key={idx} className="message">
                  <div className={`avatar ${msg.role}`}>
                    {msg.role === 'assistant' ? <Bot size={18} /> : <User size={18} />}
                  </div>
                  <div className={`message-content ${msg.role}`}>
                    <p>{msg.content}</p>
                  </div>
                </div>
              ))}
              
              {isChatProcessing && (
                <div className="message">
                  <div className="avatar assistant">
                    <Bot size={18} />
                  </div>
                  <div className="message-content assistant">
                    <div className="typing-indicator">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="chat-input">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about the detection..."
                disabled={isChatProcessing}
              />
              <button 
                onClick={handleSendMessage} 
                disabled={!inputMessage.trim() || isChatProcessing} 
                className="send-btn"
                aria-label="Send message"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Toggle Button */}
        <button 
          className="chat-toggle-btn" 
          onClick={() => setShowChat(!showChat)}
          aria-label="Toggle chat"
        >
          {showChat ? <X size={28} /> : <MessageCircle size={28} />}
        </button>
      </div>
    </div>
  );
}