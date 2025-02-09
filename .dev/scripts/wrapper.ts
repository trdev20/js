import fs from "fs-extra";
import path from "path";
import { joinPwd, throwError } from "./_utils";

const relativePath = process.argv.slice(2);

let scriptPath = joinPwd(".dev/scripts", ...relativePath);

const isScript = scriptPath.split(path.sep).every((part) => !part.startsWith("_"));

if (!isScript) {
  throwError(["❌ Not a script.", "One of the path parts start with an underscore (_):", `- ${scriptPath}`]);
}

if (!fs.existsSync(scriptPath)) {
  scriptPath += ".ts";
}

if (!fs.existsSync(scriptPath)) {
  throwError(["❌ Script not found:", `- ${scriptPath}`]);
}

if (
  fs.statSync(scriptPath).isDirectory() &&
  !fs.readdirSync(scriptPath).find((file) => file === "index.ts")
) {
  throwError(["❌ Script is a directory with no `index.ts` file:", `- ${scriptPath}`]);
}

require(scriptPath);
