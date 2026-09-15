const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const target = (process.argv[2] || 'sqlite').toLowerCase();

const rootDir = path.resolve(__dirname, '..');
const prismaDir = path.join(rootDir, 'prisma');
const schemaDest = path.join(prismaDir, 'schema.prisma');

let sourceFile = '';
if (target === 'postgres' || target === 'postgresql') {
  sourceFile = path.join(prismaDir, 'schema.postgresql.prisma');
  console.log('🔄 Switching Prisma datasource to PostgreSQL (schema.postgresql.prisma)...');
} else {
  sourceFile = path.join(prismaDir, 'schema.sqlite.prisma');
  // If schema.sqlite.prisma doesn't exist yet, we save current SQLite schema
  if (!fs.existsSync(sourceFile) && fs.existsSync(schemaDest)) {
    fs.copyFileSync(schemaDest, sourceFile);
  }
  console.log('🔄 Switching Prisma datasource to SQLite (schema.sqlite.prisma)...');
}

if (!fs.existsSync(sourceFile)) {
  console.error(`❌ Source schema file not found: ${sourceFile}`);
  process.exit(1);
}

fs.copyFileSync(sourceFile, schemaDest);
console.log(`✅ Updated ${schemaDest}`);

try {
  console.log('📦 Running `npx prisma generate`...');
  execSync('npx prisma generate', { cwd: rootDir, stdio: 'inherit' });
  console.log(`✨ Successfully switched database provider to: ${target.toUpperCase()}`);
} catch (err) {
  console.error('Failed to generate Prisma client:', err.message);
  process.exit(1);
}
