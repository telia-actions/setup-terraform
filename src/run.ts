import * as os from 'os';
import * as path from 'path';
import * as util from 'util';
import * as fs from 'fs';

import * as toolCache from '@actions/tool-cache';
import * as core from '@actions/core';

const toolName = 'terraform';
const stableVersion = '1.0.0';

export function getDownloadURL(version: string): string {
  switch (os.type()) {
    case 'Linux':
    default:
      return util.format('https://releases.hashicorp.com/terraform/%s/terraform_%s_linux_amd64.zip', version, version);
  }
}

export async function getStableVersion(): Promise<string> {
  return stableVersion;
}

export async function download(version: string): Promise<string> {
  let downloadPath;
  let cachedToolpath = toolCache.find(toolName, version);
  if (!cachedToolpath) {
    try {
      downloadPath = await toolCache.downloadTool(getDownloadURL(version));
    } catch (exception) {
      throw new Error(util.format("Failed to download %s from location ", toolName, getDownloadURL(version)));
    }

    fs.chmodSync(downloadPath, '777');
    const unzipedPath = await toolCache.extractZip(downloadPath);
    cachedToolpath = await toolCache.cacheDir(unzipedPath, toolName, version);
  }

  const toolPath = await path.join(cachedToolpath, toolName);
  if (!fs.statSync(toolPath).isFile()) {
    throw new Error(util.format("%s executable not found in path ", toolName, cachedToolpath));
  }

  fs.chmodSync(toolPath, '777');
  return toolPath;
}

export async function run() {
  let version = core.getInput('version', { 'required': true });
  if (version.toLocaleLowerCase() === 'latest') {
    version = await getStableVersion();
  }

  let cachedPath = await download(version);

  core.addPath(path.dirname(cachedPath));

  console.log(`${toolName} tool version: '${version}' has been cached at ${cachedPath}`);
  core.setOutput(util.format("%s-path", toolName), cachedPath);
}

run().catch(core.setFailed);
