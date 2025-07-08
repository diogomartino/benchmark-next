import { getProcessPidByName } from "./get-process-pid-by-name";

const plotMemory = async (interval: number = 0.5, filePath: string) => {
  const processId = await getProcessPidByName("next-server");

  if (!processId) {
    throw new Error("Next.js server process not found.");
  }

  const psrecord = Bun.spawn([
    "psrecord",
    `${processId}`,
    "--interval",
    `${interval}`,
    "--plot",
    filePath,
  ]);
  const stopMonitoring = async () => {
    psrecord.kill("SIGINT");
    await psrecord.exited;
  };

  return stopMonitoring;
};

export { plotMemory };
