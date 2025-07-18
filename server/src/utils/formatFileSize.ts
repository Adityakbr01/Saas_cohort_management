// utils/formatFileSize.ts
export const formatFileSize = (bytes: number): string => {
  const kb = bytes / 1024;
  const mb = kb / 1024;
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${kb.toFixed(0)} KB`;
};
