import { exec } from "child_process";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const killAllNextProcesses = async () => {
  try {
    await exec("pkill -f next");
  } catch (error) {
    console.error("Error killing Next.js processes:", error);
  }
};

export { sleep, killAllNextProcesses };
