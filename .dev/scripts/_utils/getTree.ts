import fs from "fs-extra";
import path from "path";

import { joinPwd } from "./utils";

const srcDir = joinPwd("src");

export type File = {
  type: "file";
  name: string;
  path: string;
};

export type Folder = {
  type: "folder";
  name: string;
  path: string;
  children: (File | Folder)[];
};

export const getSrcDirTree = () => {
  const tree: Folder = {
    type: "folder",
    name: "src",
    path: srcDir,
    children: [],
  };

  const setTreeChildren = (tree: Folder) => {
    const [files, folders] = fs.readdirSync(tree.path).reduce(
      ([files, folders], item) => {
        const itemPath = path.join(tree.path, item);
        if (fs.statSync(itemPath).isFile()) {
          files.push(itemPath);
        } else {
          folders.push(itemPath);
        }
        return [files, folders];
      },
      [[] as string[], [] as string[]],
    );

    tree.children.push(
      ...files.map<File>((file) => ({
        type: "file",
        name: path.basename(file, path.extname(file)),
        path: file,
      })),
    );

    for (const folder of folders) {
      const folderTree: Folder = {
        type: "folder",
        name: path.basename(folder),
        path: folder,
        children: [],
      };
      tree.children.push(folderTree);
      setTreeChildren(folderTree);
    }
  };

  setTreeChildren(tree);

  return tree;
};
