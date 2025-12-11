import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

function ImageUpload({ onUpload, isProcessing }) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        onUpload(event.target.result);
      };
      reader.onerror = () => {
        alert('Error reading file. Please try again.');
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload a valid image file (PNG, JPG, JPEG)');
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div>
      <h2>
        <Upload style={{ width: 20, height: 20, color: '#ef4444' }} />
        Upload Image
      </h2>
      
      <div
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`upload-area ${dragActive ? 'drag-active' : ''}`}
        style={{ 
          cursor: isProcessing ? 'not-allowed' : 'pointer',
          opacity: isProcessing ? 0.6 : 1
        }}
      >
        <Upload className="upload-icon" />
        <p className="upload-text">
          {dragActive ? 'Drop image here' : 'Click to upload or drag and drop'}
        </p>
        <p className="upload-subtext">PNG, JPG, JPEG up to 10MB</p>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          onChange={handleChange}
          style={{ display: 'none' }}
          disabled={isProcessing}
        />
      </div>
    </div>
  );
}

export default ImageUpload;