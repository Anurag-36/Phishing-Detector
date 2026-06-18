export function analyzeSsl(page) {
  if (!page) return { error: 'no_page' };
  const { protocol } = page;
  const res = { protocol };
  res.isHttp = protocol === 'http';
  // Note: full certificate checks require external APIs or native browser APIs not exposed here
  return res;
}
