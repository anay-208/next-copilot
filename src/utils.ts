import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

export function getAllFilesRelativePaths(
    dir: string,
    baseDir: string = dir
  ): string[] {
    let list: string[] = [];
    const items = readdirSync(dir);
  
    for (const item of items) {
      const fullPath = join(dir, item);
      const relativePath = relative(baseDir, fullPath);
      const stats = statSync(fullPath);
  
      if (stats.isFile()) {
        list.push(relativePath);
      } else if (stats.isDirectory()) {
        list = list.concat(getAllFilesRelativePaths(fullPath, baseDir));
      }
    }
  
    return list;
  }



