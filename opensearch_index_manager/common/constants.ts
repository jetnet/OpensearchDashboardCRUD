export const PLUGIN_ID = "opensearchIndexManager";
export const PLUGIN_NAME = "Index Manager";

export const OSD_VERSIONS = [
  "2.19.0",
  "2.19.1",
  "2.19.2",
  "2.19.3",
  "2.19.4",
] as const;
export type OsdVersion = (typeof OSD_VERSIONS)[number];

export function parseOsdVersion(version: string): OsdVersion {
  const match = version.match(/^(\d+\.\d+\.\d+)/);
  if (!match) throw new Error(`Invalid OSD version: ${version}`);
  const baseVersion = match[1];
  if ((OSD_VERSIONS as readonly string[]).indexOf(baseVersion) === -1) {
    throw new Error(`Unsupported OSD version: ${baseVersion}`);
  }
  return baseVersion as OsdVersion;
}
