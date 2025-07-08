const getProcessPidByName = async (
  processName: string
): Promise<number | null> => {
  const proc = Bun.spawn(["pgrep", "-f", processName], {
    stdout: "pipe",
    stderr: "ignore",
  });

  const output = await new Response(proc.stdout).text();
  const pid = output.trim().split("\n")[0];

  return pid ? parseInt(pid, 10) : null;
};

export { getProcessPidByName };
