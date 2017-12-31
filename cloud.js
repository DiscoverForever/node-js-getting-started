const AV = require('leanengine');
const fs = require('fs-extra');
const path = require('path');
const HOOK_DIR = path.join(__dirname, 'hook');

fs.statSync(HOOK_DIR).isDirectory() && fs.readdirSync(HOOK_DIR).forEach(dir => {
  const HOOK_FUN_FILE = path.join(HOOK_DIR, dir, `${dir}.hook.g.js`);
  const CLOUD_FUN_FILE = path.join(HOOK_DIR, dir, `${dir}.cloud.g.js`);
  if (fs.existsSync(HOOK_FUN_FILE) && fs.statSync(HOOK_FUN_FILE).isFile()) require(HOOK_FUN_FILE);
  if (fs.existsSync(CLOUD_FUN_FILE) && fs.statSync(CLOUD_FUN_FILE).isFile()) require(CLOUD_FUN_FILE);
});