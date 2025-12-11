import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

function DetectionResults({ previewImage, isProcessing, detectionResult, onReset }) {
  return (
    <div>
      <h2>
        <AlertTriangle style={{ width: 20, height: 20, color: '#ef4444' }} />
        Detection Results
      </h2>

      {/* Empty State */}
      {!previewImage && !isProcessing && !detectionResult && (
        <div className="empty-state">
          <XCircle className="empty-icon" />
          <p>No analysis yet</p>
          <p style={{ fontSize: 14, marginTop: 8, color: '#6b7280' }}>
            Capture or upload an image to begin detection
          </p>
        </div>
      )}

      {/* Preview Image */}
      {previewImage && (
        <img 
          src={previewImage} 
          alt="Preview" 
          className="preview-image" 
        />
      )}

      {/* Loading State */}
      {isProcessing && (
        <div className="loading-state">
          <RefreshCw className="spinner" />
          <p style={{ fontSize: 18, fontWeight: 600 }}>Analyzing image...</p>
          <p style={{ color: '#6b7280', fontSize: 14, marginTop: 8 }}>
            Processing with AI model
          </p>
        </div>
      )}

      {/* Detection Results */}
      {detectionResult && (
        <div>
          <div className={`result-card ${detectionResult.detected ? 'threat' : 'safe'}`}>
            <div className="result-header">
              {detectionResult.detected ? (
                <AlertTriangle className="result-icon" style={{ color: '#ef4444' }} />
              ) : (
                <CheckCircle className="result-icon" style={{ color: '#16a34a' }} />
              )}
              <h3 className="result-title">
                {detectionResult.detected ? 'THREAT DETECTED' : 'NO THREAT DETECTED'}
              </h3>
            </div>
            
            {/* Threat Details */}
            {detectionResult.detected && (
              <div className="result-details">
                <div className="result-row">
                  <span className="result-label">Object Type:</span>
                  <span className="result-value threat">
                    {detectionResult.objectType}
                  </span>
                </div>
                <div className="result-row">
                  <span className="result-label">Confidence:</span>
                  <span className="result-value threat">
                    {detectionResult.confidence}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${detectionResult.confidence}%` }}
                  />
                </div>
              </div>
            )}
            
            {/* Timestamp */}
            <div className="result-timestamp">
              Detected at: {detectionResult.timestamp}
            </div>
          </div>

          {/* Reset Button */}
          <button onClick={onReset} className="btn btn-secondary">
            Analyze Another Image
          </button>
        </div>
      )}
    </div>
  );
}

export default DetectionResults;