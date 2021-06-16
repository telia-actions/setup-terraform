"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = exports.download = exports.getStableVersion = exports.getDownloadURL = void 0;
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const util = __importStar(require("util"));
const fs = __importStar(require("fs"));
const toolCache = __importStar(require("@actions/tool-cache"));
const core = __importStar(require("@actions/core"));
const toolName = 'terraform';
const stableVersion = '1.0.0';
function getDownloadURL(version) {
    switch (os.type()) {
        case 'Linux':
        default:
            return util.format('https://releases.hashicorp.com/terraform/%s/terraform_%s_linux_amd64.zip', version, version);
    }
}
exports.getDownloadURL = getDownloadURL;
function getStableVersion() {
    return __awaiter(this, void 0, void 0, function* () {
        return stableVersion;
    });
}
exports.getStableVersion = getStableVersion;
function download(version) {
    return __awaiter(this, void 0, void 0, function* () {
        let downloadPath;
        let cachedToolpath = toolCache.find(toolName, version);
        if (!cachedToolpath) {
            try {
                downloadPath = yield toolCache.downloadTool(getDownloadURL(version));
            }
            catch (exception) {
                throw new Error(util.format("Failed to download %s from location ", toolName, getDownloadURL(version)));
            }
            fs.chmodSync(downloadPath, '777');
            const unzipedPath = yield toolCache.extractZip(downloadPath);
            cachedToolpath = yield toolCache.cacheDir(unzipedPath, toolName, version);
        }
        const toolPath = yield path.join(cachedToolpath, toolName);
        if (!fs.statSync(toolPath).isFile()) {
            throw new Error(util.format("%s executable not found in path ", toolName, cachedToolpath));
        }
        fs.chmodSync(toolPath, '777');
        return toolPath;
    });
}
exports.download = download;
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        let version = core.getInput('terraform_version', { 'required': true });
        if (version.toLocaleLowerCase() === 'latest') {
            version = yield getStableVersion();
        }
        let cachedPath = yield download(version);
        core.addPath(path.dirname(cachedPath));
        console.log(`${toolName} tool version: '${version}' has been cached at ${cachedPath}`);
        core.setOutput(util.format("%s-path", toolName), cachedPath);
    });
}
exports.run = run;
run().catch(core.setFailed);
