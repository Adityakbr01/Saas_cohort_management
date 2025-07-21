import { UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils"; // shadcn utility

interface FancyFileUploaderProps {
  label?: string;
  accept?: string;
  onFileSelect: (file: File) => void;
  className?: string;
}

export const FancyFileUploader = ({
  label = "Choose a file",
  accept = "*",
  onFileSelect,
  className,
}: FancyFileUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onFileSelect(file);
    }
  };

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      className={cn(
        "relative group w-full rounded-lg border border-dashed border-muted-foreground bg-background p-6 text-center transition hover:shadow-md cursor-pointer",
        className
      )}
    >
      <UploadCloud className="mx-auto mb-2 h-8 w-8 text-muted-foreground group-hover:scale-110 transition-transform" />
      <p className="text-sm font-medium text-muted-foreground">{label}</p>

      {fileName && (
        <p className="text-xs mt-2 text-foreground truncate">{fileName}</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
