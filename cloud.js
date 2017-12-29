const AV = require('leanengine');
const fs = require('fs-extra');
const path = require('path');
const HOOK_DIR = path.join(__dirname, 'hook');

fs.statSync(HOOK_DIR).isDirectory() && fs.readdirSync(HOOK_DIR).forEach(dir => {
  const HOOK_FILE = path.join(HOOK_DIR, dir, `${dir}.hook.g.js`);
  if (fs.statSync(HOOK_FILE).isFile())
    require(HOOK_FILE)
});