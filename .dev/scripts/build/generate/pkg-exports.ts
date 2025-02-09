import fs from "fs-extra";
import { parse } from "jsonc-parser";

import { getSrcDirTree, joinPwd, type Folder } from "~dev/scripts/_utils";

const tree = getSrcDirTree();

type Exports = {
  [key: string]: {
    import: {
      types: string;
      default: string;
    };
    require: {
      types: string;
      default: string;
    };
  } | null;
};

const generateExports = (tree: Folder) => {
  const exports: Exports = {
    ".": null,
  };

  const _generate = (_tree: Folder = tree, nested: string[] = []) => {
    for (const child of _tree.children) {
      if (child.type === "folder") {
        const nestedPath = nested.concat(child.name).join("/");
        exports[`./${nestedPath}`] = {
          require: {
            types: `./dist/${nestedPath}/index.d.ts`,
            default: `./dist/${nestedPath}/index.js`,
          },
          import: {
            types: `./dist/${nestedPath}/index.d.mts`,
            default: `./dist/${nestedPath}/index.mjs`,
          },
        };
        _generate(child, [...nested, child.name]);
        continue;
      }

      if (child.name === "index.ts") continue;

      const nestedPath = nested.concat(child.name).join("/");

      exports[`./${nestedPath}`] = {
        require: {
          types: `./dist/${nestedPath}.d.ts`,
          default: `./dist/${nestedPath}.js`,
        },
        import: {
          types: `./dist/${nestedPath}.d.mts`,
          default: `./dist/${nestedPath}.mjs`,
        },
      };
    }
  };

  _generate();

  return exports;
};

const exports = generateExports(tree);

const packageJsonPath = joinPwd("package.json");
const packageJsonContent = fs.readFileSync(packageJsonPath, "utf-8");
const packageJson = parse(packageJsonContent);

packageJson.exports = exports;

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
