const getFileName = (
  name: string,
  nextVersion: string,
  isTurbo: boolean
): string => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${hours}_${minutes}_${seconds}-${name}-${nextVersion}${
    isTurbo ? "-turbo" : ""
  }`;
};

export { getFileName };
