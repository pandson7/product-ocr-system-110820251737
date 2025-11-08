import React, { useState, useCallback } from 'react';
import './App.css';

interface ExtractedData {
  productName: string;
  brand: string;
  category: string;
  price: string;
  dimensions: string;
  weight: string;
  description: string;
  additionalDetails: string;
}

interface ProcessingResult {
  imageId: string;
  status: string;
  extractedData?: ExtractedData;
  errorMessage?: string;
}

const API_BASE_URL = 'https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/prod';

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
      setError(null);
    }
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setResult(null);
      setError(null);
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const uploadImage = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      // Get pre-signed URL
      const uploadResponse = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: selectedFile.name,
          fileType: selectedFile.type,
        }),
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { imageId, uploadUrl } = await uploadResponse.json();

      // Upload file to S3
      const s3Response = await fetch(uploadUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: {
          'Content-Type': selectedFile.type,
        },
      });

      if (!s3Response.ok) {
        throw new Error('Failed to upload image');
      }

      setUploading(false);
      setProcessing(true);

      // Poll for results
      pollForResults(imageId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploading(false);
    }
  };

  const pollForResults = async (imageId: string) => {
    const maxAttempts = 30;
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/status/${imageId}`);
        
        if (!response.ok) {
          throw new Error('Failed to check status');
        }

        const data = await response.json();
        
        if (data.status === 'completed') {
          setResult(data);
          setProcessing(false);
        } else if (data.status === 'failed') {
          setError(data.errorMessage || 'Processing failed');
          setProcessing(false);
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 2000);
        } else {
          setError('Processing timeout');
          setProcessing(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Status check failed');
        setProcessing(false);
      }
    };

    poll();
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Product Image OCR System</h1>
        <p>Upload product images to automatically extract specifications</p>
      </header>

      <main className="main-content">
        <div className="upload-section">
          <div
            className={`upload-area ${selectedFile ? 'has-file' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {selectedFile ? (
              <div className="file-preview">
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Preview"
                  className="preview-image"
                />
                <p>{selectedFile.name}</p>
              </div>
            ) : (
              <div className="upload-placeholder">
                <p>Drag and drop an image here, or click to select</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="file-input"
                />
              </div>
            )}
          </div>

          {selectedFile && (
            <button
              onClick={uploadImage}
              disabled={uploading || processing}
              className="upload-button"
            >
              {uploading ? 'Uploading...' : processing ? 'Processing...' : 'Process Image'}
            </button>
          )}
        </div>

        {error && (
          <div className="error-message">
            <h3>Error</h3>
            <p>{error}</p>
          </div>
        )}

        {result && result.extractedData && (
          <div className="results-section">
            <h2>Extracted Product Information</h2>
            <div className="results-grid">
              <div className="result-item">
                <label>Product Name:</label>
                <span>{result.extractedData.productName}</span>
              </div>
              <div className="result-item">
                <label>Brand:</label>
                <span>{result.extractedData.brand}</span>
              </div>
              <div className="result-item">
                <label>Category:</label>
                <span>{result.extractedData.category}</span>
              </div>
              <div className="result-item">
                <label>Price:</label>
                <span>{result.extractedData.price}</span>
              </div>
              <div className="result-item">
                <label>Dimensions:</label>
                <span>{result.extractedData.dimensions}</span>
              </div>
              <div className="result-item">
                <label>Weight:</label>
                <span>{result.extractedData.weight}</span>
              </div>
              <div className="result-item full-width">
                <label>Description:</label>
                <span>{result.extractedData.description}</span>
              </div>
              {result.extractedData.additionalDetails && (
                <div className="result-item full-width">
                  <label>Additional Details:</label>
                  <span>{result.extractedData.additionalDetails}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
