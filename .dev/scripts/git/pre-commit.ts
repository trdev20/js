import fs from "fs-extra";
import { joinPwd } from "~scripts/_utils";

const changesetsFolder = joinPwd(".changeset");

const changesets = fs
  .readdirSync(changesetsFolder)
  .filter((file) => file !== "README.md" && file.endsWith(".md"));

if (changesets.length > 0) {
  console.log(`⚠️ Found changesets (${changesets.length})`);
}
