const AV = require('leanengine');
const fs = require('fs-extra');
const path = require('path');

/**
 * 加载云函数
 */
function loadCloudFun() {
  const HOOK_DIR = path.join(__dirname, 'hook');
  return fs.statSync(HOOK_DIR).isDirectory() && fs.readdirSync(HOOK_DIR).map(dir => {
    const HOOK_FUN_FILE = path.join(HOOK_DIR, dir, `${dir}.hook.g.js`);
    const CLOUD_FUN_FILE = path.join(HOOK_DIR, dir, `${dir}.cloud.g.js`);
    if (fs.existsSync(HOOK_FUN_FILE) && fs.statSync(HOOK_FUN_FILE).isFile()) {
      require(HOOK_FUN_FILE);
      return dir;
    }
    if (fs.existsSync(CLOUD_FUN_FILE) && fs.statSync(CLOUD_FUN_FILE).isFile()) {
      require(CLOUD_FUN_FILE);
    }
  });
}
/**
 * 创建管理员用户
 * @param {*} username 
 * @param {*} password 
 */
async function createAdminUser(username = 'admin', password = 'admin!@123') {
  let adminUser = await getUser(username);
  if (adminUser) return adminUser;

  let user = new AV.User();
  user.setUsername(username);
  user.setPassword(password);
  user.setEmail('example@1234.com');
  return user.signUp();
}
/**
 * 获取用户
 * @param {*} username 
 */
function getUser(username) {
  if (!username) throw new AV.Cloud.Error('username must not null');

  try {
    let userQuery = new AV.Query(AV.User);
    userQuery.equalTo('username', username);
    return userQuery.first();
  } catch (error) {
    throw AV.Cloud.Error(`${username}query fail:${error.message}`);
  }
}
/**
 * 获取角色
 * @param {*} roleName 
 */
async function getRole(roleName) {
  if (!roleName) throw new AV.Cloud.Error('roleName must not null');
  
  try {
    let roleQuery = new AV.Query(AV.Role);
    roleQuery.equalTo('name', roleName);
    return roleQuery.first();
  } catch (e) {
    throw AV.Cloud.Error(`${roleName}query fail:${error.message}`);
  }
}
/**
 * 创建角色
 * @param {*} roleName 
 * @param {*} creator 
 * @param {*} roleAcl 
 */
async function createRole(roleName, creator, roleAcl) {
  let role = await getRole(roleName);
  if (role) return role;

  roleAcl ? roleAcl : roleAcl = new AV.ACL();
  roleAcl.setPublicReadAccess(false);
  roleAcl.setPublicWriteAccess(false);
  roleAcl.setReadAccess(creator, true);
  roleAcl.setWriteAccess(creator, true);

  role = new AV.Role(roleName, roleAcl);
  return role.save();
}
/**
 * 为每张表创建角色
 * @param {*} entities 
 * @param {*} adminUser 
 */
async function createEntityRoles(entities, adminUser) {
  let promiseList = entities.map(async entityName => {
      return await createRole(entityName, adminUser);
  });
  return Promise.all(promiseList)
}

async function bindUserToRole(user, role) {
  let roleQuery = new AV.Query(AV.Role);
  roleQuery.equalTo('name', 'Administrator');
  // 检查当前用户是否已经拥有了该角色
  roleQuery.equalTo('users', user);
  roleQuery.equalTo('name', role.get('name'));
  role = await roleQuery.first();
  if (role) {
    return role;
  } else {
    role.getUsers().add(adminUser);
    return role.save();
  }
  
}
module.exports.init = async () => {
  const enitties = loadCloudFun();
  const adminUser = await createAdminUser();
  const adminRole = await createRole('admin', adminUser);
  const entityRoles = await createEntityRoles(enitties, adminUser);
  console.info('超级管理员:', adminUser.getUsername());
  console.info('所有表角色:', entityRoles.map(role => role.get('name')))
}