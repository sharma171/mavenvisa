//formsPdfViewModal.js
import React, { useState } from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

const PDFViewerModal = ({ isOpen, onClose, pdfBase64, fileName, onDownload }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!isOpen) return null;

  // Helper function to check if file is an image
  const isImageFile = (filename) => {
    if (!filename) return false;
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico', 'tiff'];
    const extension = filename.split('.').pop()?.toLowerCase();
    return imageExtensions.includes(extension);
  };

  const isImage = isImageFile(fileName);

  // Zoom handlers
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  // Reset zoom and rotation when modal closes
  const handleClose = () => {
    setZoom(1);
    setRotation(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/80 transition-opacity duration-300" style={{marginTop:"0"}}>
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-4xl transform flex-col overflow-hidden border-l bg-background shadow-lg transition duration-500 ease-in-out animate-slide-in-from-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold truncate">{fileName}</h3>
          <div className="flex gap-2">
            {isImage && (
              <>
                <button
                  onClick={handleZoomOut}
                  className="inline-flex items-center justify-center rounded-md h-9 w-9 hover:bg-accent transition-colors"
                  title="Zoom Out"
                  disabled={zoom <= 0.5}
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="inline-flex items-center justify-center rounded-md h-9 px-3 text-sm font-medium">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="inline-flex items-center justify-center rounded-md h-9 w-9 hover:bg-accent transition-colors"
                  title="Zoom In"
                  disabled={zoom >= 3}
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button
                  onClick={handleRotate}
                  className="inline-flex items-center justify-center rounded-md h-9 w-9 hover:bg-accent transition-colors"
                  title="Rotate"
                >
                  <RotateCw className="h-4 w-4" />
                </button>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center justify-center rounded-md h-9 px-3 hover:bg-accent transition-colors text-sm"
                  title="Reset"
                >
                  Reset
                </button>
              </>
            )}
            <button
              onClick={onDownload}
              className="inline-flex items-center justify-center rounded-md h-9 px-3 hover:bg-accent transition-colors"
              title="Download"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </button>
            <button
              onClick={handleClose}
              className="inline-flex items-center justify-center rounded-md h-9 w-9 hover:bg-accent transition-colors"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-4">
          {pdfBase64 ? (
            isImage ? (
              // Image viewer with zoom and rotation
              <img
                src={`data:image/${fileName.split('.').pop()};base64,${pdfBase64}`}
                alt={fileName}
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transition: "transform 0.2s ease-in-out",
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain"
                }}
                className="rounded-lg shadow-lg"
              />
            ) : (
              // PDF viewer
              <iframe
                src={`data:application/pdf;base64,${pdfBase64}`}
                className="w-full h-full"
                title={fileName}
              />
            )
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFViewerModal;
