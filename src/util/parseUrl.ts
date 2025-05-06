export const parseUrl = (url: string) => {
  const urlObj = new URL(url);
  return {
    hostname: urlObj.hostname,
    path: urlObj.pathname + urlObj.search + urlObj.hash,
  };
};
