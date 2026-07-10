// Formats the build-time version constants for display. The short commit hash
// may be empty (git-unavailable fallback shows just the version, e.g. "dev").
export function formatVersion(version: string, sha: string): string {
  return sha ? `${version} · ${sha}` : version;
}
