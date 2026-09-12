import { useDropzone } from "react-dropzone";

interface Props {
  onFile: (file: File) => void;
  disabled?: boolean;
}

export function Dropzone({ onFile, disabled }: Props) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "text/csv": [".csv"], "application/csv": [".csv"] },
    disabled,
    onDrop: (acceptedFiles) => acceptedFiles.forEach(onFile),
  });

  return (
    <div
      {...getRootProps()}
      className={[
        "dropzone",
        isDragActive ? "dropzone--active" : "",
        disabled ? "dropzone--disabled" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <input {...getInputProps()} />
      <div className="dropzone-icon">{isDragActive ? "↓" : "⬆"}</div>
      <p className="dropzone-text">
        {isDragActive ? "Drop CSV files here…" : "Drag & drop CSV files, or click to browse"}
      </p>
      <p className="dropzone-hint">Multiple files supported, each becomes a queryable table</p>
    </div>
  );
}
