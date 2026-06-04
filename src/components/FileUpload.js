import { Upload, FileText, Image, File, X, Eye } from "lucide-react";
import toast from "react-hot-toast";

const FileUpload = ({
  files = [],
  onFilesChange,
  existingFiles = [],
  maxFiles = 5,
  acceptedFileTypes = [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"],
  MAX_FILE_SIZE_MB = 10,
  viewFile = () => { },
}) => {
  const inputId = `file-upload-${Math.random().toString(36).substring(2, 9)}`;

  const formatFileSize = (size) => {
    const sizeMB = size / 1024 / 1024;
    if (sizeMB < 1) return `${(size / 1024).toFixed(2)} KB`;
    return `${sizeMB.toFixed(2)} MB`;
  };

  const onFileSelected = (e) => {
    if (!e.target.files) return;

    const newFilesAll = Array.from(e.target.files);
    const allowedExtensions = acceptedFileTypes.map((ext) => ext.toLowerCase());
    const validFilesAccumulator = [];
    let invalidType = false;
    let oversize = false;

    for (const file of newFilesAll) {
      const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
      const sizeMB = file.size / 1024 / 1024;

      if (!allowedExtensions.includes(ext)) {
        invalidType = true;
        continue;
      }

      if (sizeMB > MAX_FILE_SIZE_MB) {
        oversize = true;
        continue;
      }

      validFilesAccumulator.push(file);
    }

    const remainingSlots = Math.max(0, maxFiles - files.length);
    let validFiles = remainingSlots > 0 ? validFilesAccumulator.slice(0, remainingSlots) : [];

    if (invalidType) toast.error("Some files have invalid file types.");
    if (oversize) toast.error(`Some files exceed the ${MAX_FILE_SIZE_MB} MB size limit.`);
    if (validFilesAccumulator.length > validFiles.length && remainingSlots === 0) {
      toast.error(`You can upload up to ${maxFiles} files only.`);
    } else if (validFilesAccumulator.length > validFiles.length && remainingSlots > 0) {
      toast.error(`Only ${remainingSlots} file(s) were accepted to respect the ${maxFiles} files limit.`);
    }

    if (validFiles.length === 0) {
      e.target.value = "";
      return;
    }

    onFilesChange([...files, ...validFiles]);
    e.target.value = "";
  };

  const removeFile = (idx) => {
    const updated = files.filter((_, i) => i !== idx);
    onFilesChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-card text-card-foreground shadow-sm border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors cursor-pointer">
        <input
          id={inputId}
          type="file"
          multiple
          value=""
          accept={acceptedFileTypes.join(",")}
          onChange={onFileSelected}
          className="hidden"
          style={{
            border: "0px",
            clip: "rect(0px, 0px, 0px, 0px)",
            clipPath: "inset(50%)",
            height: "1px",
            margin: "0px -1px -1px 0px",
            overflow: "hidden",
            padding: "0px",
            position: "absolute",
            width: "1px",
            whiteSpace: "nowrap",
          }}
        />

        <label htmlFor={inputId} className="block p-6 text-center cursor-pointer">
          <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
          <div className="space-y-2">
            <p className="text-sm font-medium">Upload supporting documents</p>
            <p className="text-xs text-muted-foreground">Drag & drop files or click to browse</p>
            <p className="text-xs text-muted-foreground">
              Supported: {acceptedFileTypes.join(", ")} • Max {maxFiles} files • {MAX_FILE_SIZE_MB} MB each
            </p>
          </div>
        </label>
      </div>

      {existingFiles.length > 0 && (
        <div className="space-y-2">
          {existingFiles.map((file, idx) => {
            // Safely derive a display name from various possible keys
            const displayName =
              file?.name ||
              file?.filename ||
              file?.file_name ||
              file?.document_name ||
              "";

            // Safely derive extension
            const ext = displayName
              ? displayName.split(".").pop()?.toLowerCase()
              : "";

            const icon =
              ext === "pdf" ? (
                <FileText className="w-4 h-4 text-red-500" />
              ) : ["jpg", "jpeg", "png"].includes(ext) ? (
                <Image className="w-4 h-4 text-blue-500" />
              ) : ["doc", "docx"].includes(ext) ? (
                <FileText className="w-4 h-4 text-indigo-500" />
              ) : (
                <File className="w-4 h-4 text-muted-foreground" />
              );

            const sizeLabel =
              typeof file?.size_mb === "number"
                ? `${file.size_mb} MB`
                : "";

            return (
              <div key={idx} className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                <div className="flex items-center space-x-3">
                  {icon}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{displayName || "Document"}</p>
                    {sizeLabel && (
                      <div className="flex items-center space-x-1 text-xs text-success">
                        <span>Uploaded</span>
                        <span>•</span>
                        <span>{sizeLabel}</span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  title={`View ${displayName || "document"}`}
                  onClick={() => viewFile(file)}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent h-9 rounded-md px-3 text-primary hover:text-primary/80"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}


      {files?.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Selected Files ({files.length})</h4>
          <div className="space-y-2">
            {files.map((file, idx) => {
              const ext = file?.name?.split(".").pop()?.toLowerCase();
              const icon =
                ext === "pdf" ? (
                  <FileText className="w-4 h-4 text-red-500" />
                ) : ["jpg", "jpeg", "png"].includes(ext) ? (
                  <Image className="w-4 h-4 text-blue-500" />
                ) : ["doc", "docx"].includes(ext) ? (
                  <FileText className="w-4 h-4 text-indigo-500" />
                ) : (
                  <File className="w-4 h-4 text-muted-foreground" />
                );

              return (
                <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    {icon}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    title={`Remove ${file.name}`}
                    onClick={() => removeFile(idx)}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
