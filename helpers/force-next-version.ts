import fs from "fs/promises";
import path from "path";

let originalNextVersion: string | undefined;

const runBunInstall = async (projectPath: string) => {
  const proc = Bun.spawn(["bun", "install"], {
    cwd: projectPath,
    stdout: "inherit",
    stderr: "inherit",
  });
  await proc.exited;

  console.log("Bun install completed.");
};

const forceNextVersion = async (
  nextVersion: string | undefined,
  projectPath: string
) => {
  if (!nextVersion) return;

  const packageJsonPath = path.join(projectPath, "package.json");
  const packageJsonString = await fs.readFile(packageJsonPath, "utf-8");
  const packageJson = JSON.parse(packageJsonString);

  originalNextVersion = packageJson.dependencies?.next;

  packageJson.dependencies.next = nextVersion;

  if (packageJson.overrides.next) {
    packageJson.overrides.next = nextVersion;
  }

  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));

  await runBunInstall(projectPath);
};

const rollbackNextVersion = async (projectPath: string) => {
  if (!originalNextVersion) return;

  await forceNextVersion(originalNextVersion, projectPath);
};

export { forceNextVersion, rollbackNextVersion };
