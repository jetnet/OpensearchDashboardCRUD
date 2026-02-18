"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OSD_VERSIONS = exports.PLUGIN_NAME = exports.PLUGIN_ID = void 0;
exports.parseOsdVersion = parseOsdVersion;
exports.PLUGIN_ID = 'opensearch_index_manager';
exports.PLUGIN_NAME = 'Index Manager';
exports.OSD_VERSIONS = ['2.19.0', '2.19.1', '2.19.2', '2.19.3', '2.19.4'];
function parseOsdVersion(version) {
    const match = version.match(/^(\d+\.\d+\.\d+)/);
    if (!match)
        throw new Error(`Invalid OSD version: ${version}`);
    const baseVersion = match[1];
    if (exports.OSD_VERSIONS.indexOf(baseVersion) === -1) {
        throw new Error(`Unsupported OSD version: ${baseVersion}`);
    }
    return baseVersion;
}
