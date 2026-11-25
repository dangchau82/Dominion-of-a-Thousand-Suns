// Minimal typing so the AI fairness test can read source files without @types/node.
declare module "node:fs" {
  export function readFileSync(path: string, encoding: "utf8"): string;
}
