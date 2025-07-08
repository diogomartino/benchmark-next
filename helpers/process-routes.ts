import { fetchPage } from "./fetch-page";

const processRoutes = async (baseUrl: string, paths: string[]) => {
  const results: {
    [key: string]: number;
  } = {};

  for (const path of paths) {
    const start = performance.now();
    await fetchPage(baseUrl, path);
    const end = performance.now();

    results[path] = end - start;
  }

  return results;
};

export { processRoutes };
