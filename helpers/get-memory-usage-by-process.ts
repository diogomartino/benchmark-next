import { exec } from "child_process";

const getMemoryUsageByProcess = async (processName: string) => {
  return new Promise<number>((resolve, reject) => {
    exec(
      `ps aux --sort=-%mem | grep ${processName} | grep -v grep`,
      (err, stdout, stderr) => {
        if (err || stderr) {
          reject(stderr);
          return;
        }

        const processes = stdout.split("\n").filter(Boolean);

        processes.forEach((process) => {
          const processInfo = process.split(/\s+/);
          const rssInKB = processInfo[5];

          if (!rssInKB) {
            reject("No memory usage found for the specified process.");
            return;
          }

          const rssInMB = parseInt(rssInKB) / 1024;
          const processNameExtracted = processInfo.slice(10).join(" ");
          if (processNameExtracted.includes(processName)) {
            resolve(rssInMB);
          }
        });
      }
    );
  });
};

export { getMemoryUsageByProcess };
