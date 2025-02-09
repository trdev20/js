import path from "path";

/**
 * Project Working Directory
 */
export const pwd = path.join(__dirname, "../../../");

/**
 * join path with Project Working Directory
 */
export const joinPwd = (...paths: string[]) => path.join(pwd, ...paths);

export const throwError: {
  (message: string): never;
  (lines: string[]): never;
} = (message) => {
  message = typeof message === "string" ? message : message.join("\n");
  console.log(message);
  process.exit(1);
};
