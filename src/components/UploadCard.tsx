import { useRef, useState } from 'react';
import { UploadCloud, FileSpreadsheet } from 'lucide-react';

interface UploadCardProps {
  onFile: (buffer: ArrayBuffer, fileName: string) => void;
  onError: (msg: string) => void;
  onMockLoad: () => void;
}

export function UploadCard({ onFile, onError, onMockLoad }: UploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const processFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      onError('Invalid file type. Please upload a valid .xlsx Excel file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      if (buffer) {
        onFile(buffer, file.name);
      }
    };
    reader.onerror = () => onError('Failed to read the file. Please try again.');
    reader.readAsArrayBuffer(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset input so the same file can be re-uploaded if needed
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  return (
    <div className="upload-section">
      <div
        className={`upload-card ${dragging ? 'upload-card--drag' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        role="button"
        tabIndex={0}
        aria-label="Upload Excel file"
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        <div className="upload-card__icon-wrap" aria-hidden="true">
          <UploadCloud size={36} strokeWidth={1.5} />
        </div>
        <h3 className="upload-card__title">
          {dragging ? 'Drop your file here' : 'Upload Excel File'}
        </h3>
        <p className="upload-card__subtitle">
          Drag &amp; drop or click to browse &mdash; <strong>.xlsx</strong> files only
        </p>
        <div className="upload-card__badge">
          <FileSpreadsheet size={14} aria-hidden="true" />
          <span>Requires sheet: <code>flat_Name_Convention</code></span>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx"
          className="upload-card__input"
          onChange={handleInputChange}
          aria-hidden="true"
        />
      </div>

      {/* Dev helper: load mock data without a real file */}
      <button className="mock-btn" onClick={onMockLoad} type="button">
        Load sample data (for testing)
      </button>
    </div>
  );
}
