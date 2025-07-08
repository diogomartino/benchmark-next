import fs from "fs/promises";
import path from "path";

const getProjectInfo = async (projectPath: string) => {
  const packageJsonPath = path.join(projectPath, "package.json");
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"));

  const nextVersion =
    packageJson.dependencies?.next ||
    packageJson.devDependencies?.next ||
    "unknown";

  const isTurbo = packageJson.scripts?.dev?.includes("turbopack");
  const projectName = packageJson.name || path.basename(projectPath);

  return {
    name: projectName,
    nextVersion,
    isTurbo,
  };
};

export { getProjectInfo };
