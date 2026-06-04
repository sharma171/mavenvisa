import React, { useState, useRef, useEffect } from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

const PDFViewerModal = ({ isOpen, onClose, pdfBase64, fileName, onDownload }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [fileUrl, setFileUrl] = useState(null);
  const iframeRef = useRef(null);

  // Helper function to check if file is an image
  const isImageFile = (filename) => {
    if (!filename) return false;
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico', 'tiff', 'tif'];
    const extension = filename.split('.').pop()?.toLowerCase();
    return imageExtensions.includes(extension);
  };

  const isImage = isImageFile(fileName);

  useEffect(() => {
    if (pdfBase64 && isOpen) {
      // Convert base64 to Blob
      const base64toBlob = (base64, mimeType) => {
        try {
          const byteCharacters = atob(base64);
          const byteNumbers = new Array(byteCharacters.length);
          
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          
          const byteArray = new Uint8Array(byteNumbers);
          return new Blob([byteArray], { type: mimeType });
        } catch (error) {
          console.error('Error converting base64 to blob:', error);
          return null;
        }
      };

      // Determine MIME type based on file extension
      const getMimeType = (filename) => {
        if (!filename) return 'application/pdf';
        const ext = filename.split('.').pop()?.toLowerCase();
        const mimeTypes = {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'gif': 'image/gif',
          'bmp': 'image/bmp',
          'svg': 'image/svg+xml',
          'webp': 'image/webp',
          'ico': 'image/x-icon',
          'tiff': 'image/tiff',
          'tif': 'image/tiff',
          'pdf': 'application/pdf'
        };
        return mimeTypes[ext] || 'application/pdf';
      };

      const mimeType = getMimeType(fileName);
      const blob = base64toBlob(pdfBase64, mimeType);
      
      if (blob) {
        const url = URL.createObjectURL(blob);
        setFileUrl(url);
      }
    }

    // Cleanup
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [pdfBase64, isOpen, fileName]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleClose = () => {
    setZoom(1);
    setRotation(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/80 transition-opacity duration-300"
        style={{marginTop:"0"}}
        onClick={handleClose}
      />

      {/* Slide-in Panel */}
      <div 
        className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-6xl transform flex-col overflow-hidden border-l bg-background shadow-lg transition duration-500 ease-in-out animate-slide-in-from-right" 
        style={{marginTop:"0"}}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-muted/30 px-6 py-4">
          <div className="flex-1 min-w-0 pr-4">
            <h3 className="text-lg font-semibold truncate">
              {fileName || 'Document'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isImage ? 'Image File' : 'PDF Document'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="rounded-md p-2 hover:bg-muted transition-colors shrink-0"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action Buttons */}
        {/* <div className="flex items-center gap-2 border-b bg-muted/20 px-6 py-3">
          <button
            onClick={handleZoomOut}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent transition-colors"
            title="Zoom Out"
            disabled={zoom <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          
          <button
            onClick={handleResetZoom}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent transition-colors"
            title="Reset Zoom"
          >
            {Math.round(zoom * 100)}%
          </button>
          
          <button
            onClick={handleZoomIn}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent transition-colors"
            title="Zoom In"
            disabled={zoom >= 3}
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          {isImage && (
            <button
              onClick={handleRotate}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent transition-colors"
              title="Rotate"
            >
              <RotateCw className="h-4 w-4" />
              Rotate
            </button>
          )}

          <div className="flex-1" />

          <button
            onClick={onDownload}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent transition-colors"
            title="Download"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        </div> */}

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-muted/5 p-4">
          {fileUrl ? (
            isImage ? (
              // Image viewer with zoom and rotation
              <div className="flex items-center justify-center min-h-full">
                <img
                  src={fileUrl}
                  alt={fileName}
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transformOrigin: 'center center',
                    transition: "transform 0.2s ease-in-out",
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain"
                  }}
                  className="rounded-lg shadow-lg"
                />
              </div>
            ) : (
              // PDF viewer with zoom
              <div
                className="flex items-center justify-center min-h-full"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top center',
                  transition: "transform 0.2s"
                }}
              >
                <iframe
                  ref={iframeRef}
                  src={fileUrl}
                  className="w-full h-full min-h-[calc(100vh-145px)] rounded-lg border bg-white shadow-lg"
                  title={fileName || 'PDF Viewer'}
                  style={{
                    border: 'none'
                  }}
                />
              </div>
            )
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">
                {isImage ? 'Loading Image...' : 'Loading PDF...'}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PDFViewerModal;
