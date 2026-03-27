// Script to seed initial menu data
const { execSync } = require('child_process');
const fs = require('fs');

const sql = `
INSERT INTO sys_menu (parentId, name, path, component, permission, icon, type, sort, status, visible) VALUES
-- Level 1: System Management (directory)
(0, 'System Management', '/system', NULL, NULL, 'Setting', 0, 1, 1, 1),
-- Level 2: User Management (menu)
(1, 'User Management', '/system/user', 'system/user/index', NULL, 'User', 1, 1, 1, 1),
-- Level 2: Role Management (menu)
(1, 'Role Management', '/system/role', 'system/role/index', NULL, 'UserFilled', 1, 2, 1, 1),
-- Level 2: Menu Management (menu)
(1, 'Menu Management', '/system/menu', 'system/menu/index', NULL, 'Menu', 1, 3, 1, 1),
-- Level 3: User buttons
(2, 'User List', NULL, NULL, 'sys:user:list', NULL, 2, 1, 1, 1),
(2, 'Create User', NULL, NULL, 'sys:user:create', NULL, 2, 2, 1, 1),
(2, 'Update User', NULL, NULL, 'sys:user:update', NULL, 2, 3, 1, 1),
(2, 'Delete User', NULL, NULL, 'sys:user:delete', NULL, 2, 4, 1, 1),
-- Level 3: Role buttons
(3, 'Role List', NULL, NULL, 'sys:role:list', NULL, 2, 1, 1, 1),
(3, 'Create Role', NULL, NULL, 'sys:role:create', NULL, 2, 2, 1, 1),
(3, 'Update Role', NULL, NULL, 'sys:role:update', NULL, 2, 3, 1, 1),
(3, 'Delete Role', NULL, NULL, 'sys:role:delete', NULL, 2, 4, 1, 1),
-- Level 3: Menu buttons
(4, 'Menu List', NULL, NULL, 'sys:menu:list', NULL, 2, 1, 1, 1),
(4, 'Create Menu', NULL, NULL, 'sys:menu:create', NULL, 2, 2, 1, 1),
(4, 'Update Menu', NULL, NULL, 'sys:menu:update', NULL, 2, 3, 1, 1),
(4, 'Delete Menu', NULL, NULL, 'sys:menu:delete', NULL, 2, 4, 1, 1);

-- Assign all menus to Super Admin role
INSERT INTO sys_role_menu (role_id, menu_id)
SELECT 1, id FROM sys_menu;
`;

fs.writeFileSync('scripts/temp_seed.sql', sql);
execSync('docker exec -i admin-mysql mysql -uadmin -pAdmin@123456 admin_system < scripts/temp_seed.sql');
fs.unlinkSync('scripts/temp_seed.sql');
console.log('Menu data seeded successfully!');
