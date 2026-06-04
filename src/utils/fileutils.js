import { FileText, FileText as FilePdf, Image, ImageIcon } from "lucide-react";

export function convertFilesToBase64(files) {
  if (!files || files.length === 0) return Promise.resolve([]);

  return Promise.all(
    Array.from(files).map((file) => {
      return new Promise((resolve, reject) => {
        try {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const base64Content = reader.result.split(",")[1];
              resolve({
                filename: file.name,
                document_type: "proof",
                content: base64Content,
              });
            } catch (err) {
              reject(new Error(`Error processing file: ${file.name}`));
            }
          };
          reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
          reader.readAsDataURL(file);
        } catch (err) {
          reject(new Error(`Unexpected error reading file: ${file.name}`));
        }
      });
    })
  ).catch((err) => {
    console.error("File conversion error:", err);
    return [];
  });
}

export const getFileIcon = (type) => {
  switch (type) {
    case "pdf":
      return <FilePdf className="h-5 w-5 flex-shrink-0 text-red-500" />;
    case "image":
      return <Image className="h-5 w-5 flex-shrink-0 text-green-500" />;
    case "presentation":
      return <FileText className="h-5 w-5 flex-shrink-0 text-orange-500" />;
    default:
      return <FileText className="h-5 w-5 flex-shrink-0 text-gray-500" />;
  }
};

export const getFileIconByMime = (mimeType) => {
  if (!mimeType) return <FileText className="h-5 w-5 flex-shrink-0 text-gray-500" />;

  if (mimeType === "application/pdf") {
    return <FilePdf className="h-5 w-5 flex-shrink-0 text-red-500" />;
  } else if (mimeType.startsWith("image/")) {
    return <ImageIcon className="h-5 w-5 flex-shrink-0 text-green-500" />;
  } else if (
    mimeType === "application/vnd.ms-powerpoint" ||
    mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  ) {
    return <FileText className="h-5 w-5 flex-shrink-0 text-orange-500" />;
  } else {
    return <FileText className="h-5 w-5 flex-shrink-0 text-gray-500" />;
  }
};
