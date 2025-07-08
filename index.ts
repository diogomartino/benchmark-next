import path from "path";
import { parseArgs } from "util";
import fs from "fs/promises";
import { scanRoutes } from "./helpers/scanner";
import { getMemoryUsageByProcess } from "./helpers/get-memory-usage-by-process";
import { processRoutes } from "./helpers/process-routes";
import { ensureDir } from "./helpers/ensure-dir";
import { getProjectInfo } from "./helpers/get-project-info";
import type { TResult } from "./types";
import { killAllNextProcesses } from "./helpers/utils";
import { runNextJsServer } from "./helpers/run-next-server";
import { plotMemory } from "./helpers/plot-memory";
import { getFileName } from "./helpers/get-file-name";
import { ensureDeps } from "./helpers/ensure-deps";
import {
  forceNextVersion,
  rollbackNextVersion,
} from "./helpers/force-next-version";

ensureDeps();

const resultsDir = path.join("results", Date.now().toString());

await ensureDir("results");
await ensureDir(resultsDir);

const results: TResult = {
  date: new Date().toISOString(),
  projectName: "",
  coldStartMemory: 0,
  warmStartMemory: 0,
  coldEndMemory: 0,
  warmEndMemory: 0,
  coldStartTime: 0,
  coldEndTime: 0,
  warmStartTime: 0,
  warmEndTime: 0,
  totalTime: 0,
  isTurbo: false,
  nextVersion: "unknown",
  coldResults: {},
  warmResults: {},
};

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    project: {
      type: "string",
      default: "/home/martino/repos/next-app-router-playground",
      description: "Path to the Next.js project directory",
    },
    baseUrl: {
      type: "string",
      default: "http://localhost:3000",
      description: "Base URL for the Next.js server",
    },
    noCache: {
      type: "boolean",
      default: false,
      description: "Clear the .next directory before running",
    },
    fetchOnly: {
      type: "boolean",
      default: false,
      description: "Only fetch routes without running the server",
    },
    nextVersion: {
      type: "string",
      default: undefined,
      description: "Next.js version to use",
    },
  },
  strict: false,
});

const { project, baseUrl, noCache, fetchOnly, nextVersion } = values as {
  project: string;
  baseUrl: string;
  noCache: boolean;
  fetchOnly: boolean;
  nextVersion: string | undefined;
};

console.log(`Project: "${project}"`);

if (!project) {
  throw new Error(
    "Project directory is required. Use --project to specify it."
  );
}

const projectPath = path.resolve(project);
const projectExists = await fs.exists(projectPath);

if (!projectExists) {
  throw new Error(`Project directory does not exist: ${projectPath}`);
}

if (nextVersion) {
  await forceNextVersion(nextVersion, projectPath);
}

if (noCache) {
  console.log("No cache mode enabled. Clearing .next directory...");

  const cachePath = path.join(projectPath, ".next");
  await fs.rm(cachePath, { recursive: true, force: true });
}

const projectInfo = await getProjectInfo(projectPath);
const routes = scanRoutes(projectPath);

results.projectName = projectInfo.name;
results.isTurbo = projectInfo.isTurbo;
results.nextVersion = projectInfo.nextVersion;

const baseFileName = await getFileName(
  projectInfo.name,
  projectInfo.nextVersion,
  projectInfo.isTurbo
);

console.log(
  `Found ${routes.length} routes in ${projectInfo.name}. (next: ${
    projectInfo.nextVersion
  } ${projectInfo.isTurbo ? "Turbopack" : "Webpack"})`
);

if (!fetchOnly) {
  killAllNextProcesses();
  console.log("Starting Next.js server...");
  await runNextJsServer(projectPath);
  console.log("NextJS server started and ready to process routes.");
}

const stopPlotting = await plotMemory(
  0.5,
  path.join(resultsDir, `${baseFileName}.png`)
);

console.log("\nStarting cold run\n");
console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");

// process routes (cold run)
results.coldStartMemory = await getMemoryUsageByProcess("next-server");
results.coldStartTime = performance.now();
results.coldResults = await processRoutes(baseUrl, routes);
results.coldEndTime = performance.now();
results.coldEndMemory = await getMemoryUsageByProcess("next-server");

console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
console.log("\nStarting warm run\n");
console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");

// process routes (warm run)
results.warmStartMemory = await getMemoryUsageByProcess("next-server");
results.warmStartTime = performance.now();
results.warmResults = await processRoutes(baseUrl, routes);
results.warmEndTime = performance.now();
results.warmEndMemory = await getMemoryUsageByProcess("next-server");

console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
console.log("\nWarm run completed\n");

const report = [
  "==========================================================",
  `NextJS version: ${results.nextVersion}`,
  `Turbo: ${results.isTurbo ? "Yes" : "No"}`,
  `Project: ${results.projectName}`,
  `Routes processed: ${routes.length}`,
  `Cold run:`,
  `- Start memory: ${results.coldStartMemory.toFixed(2)} MB`,
  `- End memory: ${results.coldEndMemory.toFixed(2)} MB`,
  `- Took: ${(results.coldEndTime - results.coldStartTime).toFixed(2)} ms`,
  `Warm run:`,
  `- Start memory: ${results.warmStartMemory.toFixed(2)} MB`,
  `- End memory: ${results.warmEndMemory.toFixed(2)} MB`,
  `- Took: ${(results.warmEndTime - results.warmStartTime).toFixed(2)} ms`,
  (() => {
    results.totalTime = (results.warmEndTime - results.coldStartTime) / 1000;

    return `Total time: ${results.totalTime.toFixed(2)} seconds`;
  })(),
  `Memory growth: ${results.coldStartMemory.toFixed(
    2
  )} MB to ${results.warmEndMemory.toFixed(2)} MB`,
  "==========================================================",
].join("\n");

console.log(report);

await fs.writeFile(path.join(resultsDir, "report.txt"), report);

await stopPlotting();

if (!fetchOnly) {
  killAllNextProcesses();
}

if (nextVersion) {
  await rollbackNextVersion(projectPath);
}

const jsonPath = path.join(resultsDir, `${baseFileName}.json`);

await fs.writeFile(jsonPath, JSON.stringify(results, null, 2));

console.log(`Results saved to ${resultsDir}`);
process.exit(0);
