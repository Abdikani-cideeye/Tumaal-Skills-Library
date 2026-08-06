import fs from 'node:fs';
import path from 'node:path';

export function mkdirp(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function writeFile(filePath: string, content: string): void {
  mkdirp(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf-8');
}

export function exists(filePath: string): boolean {
  return fs.existsSync(filePath);
}
