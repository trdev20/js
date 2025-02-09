import fs from "fs-extra";
import path from "path";

import type { File, Folder } from "~dev/scripts/_utils";
import { getSrcDirTree, joinPwd, throwError } from "~dev/scripts/_utils";

const srcFolder = joinPwd("src");

const tree = getSrcDirTree();

type FilesAndFolders = [File[], Folder[]];

const separateFilesFromFolders = (tree: Folder) =>
  tree.children.reduce(
    ([files, folders], file) => {
      if (file.type === "file") {
        files.push(file);
      } else {
        folders.push(file);
      }
      return [files, folders] as FilesAndFolders;
    },
    [[], []] as FilesAndFolders,
  );

const missingExports: Record<string, string[]> = {};

const checkExports = (tree: Folder) => {
  const [files, folders] = separateFilesFromFolders(tree);

  const filesToExport = files.filter((child) => !child.name.startsWith("_") && child.name !== "index");

  const indexFile = files.find((child) => child.name === "index");

  if (!indexFile) {
    throw new Error("No index.ts file found");
  }

  const indexFileExports = fs
    .readFileSync(indexFile.path, "utf-8")
    .split("\n")
    .filter((line) => line.startsWith("export"));

  for (const file of filesToExport) {
    const exportLineContent = `export * from "./${file.name}";`;
    const hasExportLine = indexFileExports.includes(exportLineContent);
    if (!hasExportLine) {
      missingExports[indexFile.path] ??= [];
      missingExports[indexFile.path]!.push(file.name + ".ts");
    }
  }

  for (const folder of folders) {
    checkExports(folder);
  }
};

checkExports(tree);

if (Object.keys(missingExports).length > 0) {
  const lines = ["❌ Missing exports:\n"];
  for (const [indexPath, indexMissingExports] of Object.entries(missingExports)) {
    const indexRelativePath = path.join("./src", path.relative(srcFolder, indexPath));
    lines.push(`- ${indexRelativePath}\n`, `• ${indexMissingExports.join("\n• ")}\n`);
  }
  throwError(lines);
}
