import {promises as fs} from 'fs';
import path from 'path';

export async function loadSource(filePath: string): Promise<string> {
  const buffer = await fs.readFile(path.join(process.cwd(), 'articles', filePath + '.md'));
  return buffer.toString('utf-8');
}
