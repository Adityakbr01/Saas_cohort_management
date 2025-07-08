import fs from "fs";
import path from "path";
import { tmpdir } from "os";

export const saveBufferToTempFile = (buffer: Buffer, filename: string): string => {
  const tempPath = path.join(tmpdir(), filename);
  fs.writeFileSync(tempPath, buffer);
  return tempPath;
};