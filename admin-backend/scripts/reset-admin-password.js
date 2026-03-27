const bcrypt = require('bcryptjs');
const { execSync } = require('child_process');

async function main() {
  const password = 'Admin@123456';
  const hash = await bcrypt.hash(password, 10);
  console.log('Generated hash:', hash);

  // Write SQL to a temp file to avoid shell escaping issues
  const fs = require('fs');
  const sql = `UPDATE sys_user SET password='${hash}' WHERE username='admin';`;
  fs.writeFileSync('scripts/temp_update.sql', sql);

  execSync('docker exec -i admin-mysql mysql -uadmin -pAdmin@123456 admin_system < scripts/temp_update.sql');
  fs.unlinkSync('scripts/temp_update.sql');

  console.log('Password updated successfully!');
  console.log('Login with: admin / Admin@123456');
}

main().catch(console.error);
