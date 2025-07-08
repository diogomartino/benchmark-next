import { exec } from "child_process";

const runNextJsServer = (projectPath: string) => {
  console.log(`Running Next.js server in project: ${projectPath}`);

  return new Promise<void>((resolve, reject) => {
    try {
      const child = exec("bun dev", { cwd: projectPath });

      if (child.stdout) {
        child.stdout.on("data", (data) => {
          if (data.includes("Ready in")) {
            console.log("Next.js server is ready.");
            resolve();
          }
        });

        // child.stdout.pipe(process.stdout);
      }

      if (child.stderr) {
        // child.stderr.pipe(process.stderr);
      }

      child.on("error", (error) => {
        console.error(`Error running Next.js server: ${error.message}`);
        reject(error);
      });

      child.on("exit", (code) => {
        if (code !== 0) {
          reject(new Error(`Next.js server exited with code ${code}`));
        } else {
          resolve();
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

export { runNextJsServer };
