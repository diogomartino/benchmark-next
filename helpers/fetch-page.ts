const fetchPage = async (
  baseUrl: string,
  path: string,
  log: boolean = true
) => {
  const fullUrl = `${baseUrl}${path}`;
  const start = performance.now();

  console.log(`Fetching: ${fullUrl}`);

  const response = await fetch(fullUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const end = performance.now();

  if (log) {
    console.log(`${path} - ${response.status} - ${(end - start).toFixed(2)}ms`);
  }

  return end - start;
};

export { fetchPage };
