export function extractSubPathsFromRoute(path: string): string[] {
  const paths = path.split("/");
  const subPaths = paths.filter((path) => path !== "");
  return subPaths;
}
