import { create } from 'domain';

const AV = require('leanengine');
const fs = require('fs-extra');
const path = require('path');

function loadCloudFun() {
  const HOOK_DIR = path.join(__dirname, 'hook');
  return fs.statSync(HOOK_DIR).isDirectory() && fs.readdirSync(HOOK_DIR).map(dir => {
    const HOOK_FUN_FILE = path.join(HOOK_DIR, dir, `${dir}.hook.g.js`);
    const CLOUD_FUN_FILE = path.join(HOOK_DIR, dir, `${dir}.cloud.g.js`);
    if (fs.existsSync(HOOK_FUN_FILE) && fs.statSync(HOOK_FUN_FILE).isFile()) {
      require(HOOK_FUN_FILE);
      return HOOK_FUN_FILE
    }
    if (fs.existsSync(CLOUD_FUN_FILE) && fs.statSync(CLOUD_FUN_FILE).isFile()) {
      require(CLOUD_FUN_FILE);
      return CLOUD_FUN_FILE;
    }
  });
}

function createAdminUser(username='admin', password='admin') {
  let user = new AV.Object(AV.User);
  user.set('username', username);
  user.set('password', password);
  return user.save();
}

function createRole(roleName, creator, roleAcl) {
  roleAcl ? roleAcl : roleAcl = new AV.ACL();
  roleAcl.setPublicReadAccess(false);
  roleAcl.setPublicWriteAccess(false);
  roleAcl.setReadAccess(creator, true);
  roleAcl.setWriteAccess(creator, true);

  const role = new AV.Role(roleName, acl);
  return role.save();
}

function createEntityRoles(adminUser) {
  const HOOK_DIR = path.join(__dirname, 'hook');

  fs.statSync(HOOK_DIR).isDirectory() && fs.readdirSync(HOOK_DIR).forEach(async entityName => {
    await createRole(entityName, adminUser);
  });
}

module.exports.init = async () => {
  const cloudFuns = loadCloudFun();
  console.log('import CLOUD FUNCTION', cloudFuns);
  const adminUser = await createAdminUser();
  const adminRole = await createRole('admin', adminUser);
  createEntityRoles(adminUser);
}