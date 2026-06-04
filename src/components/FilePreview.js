// FilePreview.js - UPDATED WITH NEW MODERN DESIGN
import { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import ThemeLoader from "./ThemeLoader";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Printer,
  X,
} from "lucide-react";

const FilePreview = ({
  base64File,
  fileType,
  setBase64File,
  setFileType,
  fileMeta = {},
  docObject = {},
  nextFunction,
  previousFunction,
  isLoading,
  hideClose,
  filePreview,
  onClose,
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [fileUrl, setFileUrl] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLast, setIsLast] = useState(false);
  const [isFirst, setIsFirst] = useState(false);
  const iframeRef = useRef(null);

  // Handle both old and new prop formats
  const actualBase64 = base64File || filePreview?.content;
  const actualFileType = fileType || filePreview?.mime_type;
  const actualFileName = docObject?.file_name || filePreview?.filename;

  let { currentFileName, allFileNames } = fileMeta;
  let isResume = String(docObject?.doc_type).toLowerCase() === "resume" && 
                  docObject?.file_extension !== "application/pdf";

  console.log('📄 FilePreview Props:', {
    hasBase64: !!actualBase64,
    base64Length: actualBase64?.length,
    fileType: actualFileType,
    fileName: actualFileName,
  });

  // Helper function to check if file is an image
  const isImageFile = (mimeType, filename) => {
    if (mimeType) {
      const imageTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
        'image/bmp', 'image/webp', 'image/svg+xml', 'image/tiff'
      ];
      return imageTypes.includes(mimeType.toLowerCase());
    }
    
    if (filename) {
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico', 'tiff', 'tif'];
      const extension = filename.split('.').pop()?.toLowerCase();
      return imageExtensions.includes(extension);
    }
    
    return false;
  };

  const isPdfFile = (mimeType) => {
    return mimeType?.toLowerCase() === 'application/pdf';
  };

  const isImage = isImageFile(actualFileType, actualFileName);
  const isPdf = isPdfFile(actualFileType);

  const firstlast = () => {
    if (!allFileNames || !currentFileName) return;
    const index = allFileNames.indexOf(currentFileName);
    setIsFirst(index === 0);
    setIsLast(index === allFileNames.length - 1);
  };

  useEffect(() => {
    if (currentFileName && allFileNames) {
      firstlast();
    }
  }, [currentFileName, allFileNames]);

  useEffect(() => {
    if (actualBase64) {
      setIsOpen(true);
      console.log('🔄 Creating file URL from base64...');
      
      try {
        // Remove data URL prefix if present
        const cleanBase64 = actualBase64.startsWith('data:')
          ? actualBase64.split(',')[1]
          : actualBase64;

        const byteCharacters = atob(cleanBase64);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: actualFileType || 'application/octet-stream' });
        const url = URL.createObjectURL(blob);

        console.log('✅ File URL created:', {
          size: blob.size,
          type: blob.type,
        });

        setFileUrl(url);

        return () => {
          console.log('🧹 Cleaning up file URL');
          URL.revokeObjectURL(url);
        };
      } catch (error) {
        console.error('❌ Error creating file URL:', error);
      }
    } else {
      setIsOpen(false);
    }
  }, [actualBase64, actualFileType]);

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
    console.log('🚪 Closing FilePreview');
    setZoom(1);
    setRotation(0);
    setIsOpen(false);

    if (typeof setBase64File === 'function') {
      setBase64File(null);
    }
    if (typeof setFileType === 'function') {
      setFileType(null);
    }
    if (typeof onClose === 'function') {
      onClose();
    }

    setFileUrl(null);
  };

  const handleDownload = () => {
    if (!fileUrl || !actualFileName) return;

    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = actualFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log('💾 File downloaded:', actualFileName);
  };

  const handlePrint = () => {
    if (!fileUrl) return;

    if (isImage) {
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Image</title>
            <style>
              body { 
                margin: 0; 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                min-height: 100vh; 
                background: white !important;
              }
              img { 
                max-width: 100%; 
                max-height: 100vh; 
                object-fit: contain; 
              }
            </style>
          </head>
          <body>
            <img src="${fileUrl}" onload="window.print(); window.close();" />
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      window.print();
    }
    console.log('🖨️ Print initiated');
  };

  const renderNavigationButtons = () => {
    if (isResume || !nextFunction) return null;

    return ReactDOM.createPortal(
      <div 
        className="fixed z-[75] flex justify-between w-full px-8 pointer-events-none"
        style={{ top: "50%", transform: "translateY(-50%)" }}
      >
        {!isFirst && (
          <button
            onClick={previousFunction}
            className="pointer-events-auto bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-all shadow-lg"
            title="Previous"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        
        <div className="flex-1" />
        
        {!isLast && (
          <button
            onClick={nextFunction}
            className="pointer-events-auto bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-all shadow-lg"
            title="Next"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>,
      document.body
    );
  };

  const renderContent = () => {
    console.log('🎨 Rendering content...', {
      hasFileUrl: !!fileUrl,
      isImage,
      isPdf,
    });

    if (!fileUrl) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">
            {isImage ? 'Loading Image...' : isPdf ? 'Loading PDF...' : 'Loading File...'}
          </p>
        </div>
      );
    }

    if (isImage) {
      console.log('🖼️ Rendering Image Preview');
      return (
        <div className="flex items-center justify-center min-h-full">
          <img
            src={fileUrl}
            alt={actualFileName}
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
      );
    }

    if (isPdf) {
      console.log('📄 Rendering PDF Preview');
      return (
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
            title={actualFileName || 'PDF Viewer'}
            style={{ border: 'none' }}
          />
        </div>
      );
    }

    // Fallback for other file types
    console.log('📎 Rendering generic file preview');
    return (
      <div className="flex items-center justify-center min-h-full">
        <iframe
          src={fileUrl}
          className="w-full h-full min-h-[calc(100vh-145px)] rounded-lg border bg-white shadow-lg"
          title={actualFileName || 'File Viewer'}
          style={{ border: 'none' }}
        />
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      {ReactDOM.createPortal(
        <div
          className="fixed inset-0 z-[60] bg-black/80 transition-opacity duration-300"
          onClick={handleClose}
        />,
        document.body
      )}

      {/* Slide-in Panel */}
      {ReactDOM.createPortal(
        <div
          className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-6xl transform flex-col overflow-hidden border-l bg-background shadow-lg transition duration-500 ease-in-out"
          style={{ marginTop: "0" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b bg-muted/30 px-6 py-4">
            <div className="flex-1 min-w-0 pr-4">
              <h3 className="text-lg font-semibold truncate flex items-center gap-2">
                <FileText className="h-5 w-5 shrink-0" />
                {actualFileName || 'Document'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isImage ? 'Image File' : isPdf ? 'PDF Document' : 'File Preview'}
              </p>
            </div>
            {!hideClose && (
              <button
                onClick={handleClose}
                className="rounded-md p-2 hover:bg-muted transition-colors shrink-0"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Action Buttons */}
          

          {/* Content Area */}
          <div className="flex-1 overflow-auto bg-muted/5 p-4">
            {renderContent()}
          </div>
        </div>,
        document.body
      )}

      {/* Navigation Buttons (Previous/Next) */}
      {renderNavigationButtons()}

      {/* Loading Overlay */}
      {isLoading && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50">
          <ThemeLoader show={isLoading} fixed />
        </div>,
        document.body
      )}
    </>
  );
};

export default FilePreview;
