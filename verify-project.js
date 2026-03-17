const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'package.json',
  'next.config.mjs',
  'tailwind.config.js',
  'postcss.config.js',
  'app/page.js',
  'app/layout.js',
  'app/globals.css',
  'lib/supabase.js',
  '.gitignore'
];

console.log("🔍 Starting MJ Nail Art Project Verification...\n");

let errors = 0;

// 1. Check for Required Files
requiredFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`✅ Found: ${file}`);
  } else {
    console.error(`❌ Missing: ${file}`);
    errors++;
  }
});

// 2. Check package.json Content
if (fs.existsSync('package.json')) {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const deps = pkg.dependencies || {};
  const requiredDeps = ['next', 'react', '@supabase/supabase-js', 'resend'];
  
  requiredDeps.forEach(dep => {
    if (!deps[dep]) {
      console.error(`⚠️  Warning: '${dep}' is missing from package.json dependencies.`);
      errors++;
    }
  });
}

// 3. Check .gitignore for node_modules
if (fs.existsSync('.gitignore')) {
  const gitignore = fs.readFileSync('.gitignore', 'utf8');
  if (!gitignore.includes('node_modules')) {
    console.error("❌ CRITICAL: 'node_modules' is NOT in your .gitignore. GitHub will reject your push!");
    errors++;
  } else {
    console.log("✅ .gitignore correctly hides node_modules.");
  }
}

// 4. Check for @/ imports vs Relative paths
const checkImports = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('@/') && !fs.existsSync('jsconfig.json')) {
    console.warn(`⚠️  Potential Path Error in ${filePath}: Found '@/' import but no jsconfig.json file.`);
  }
};

checkImports('app/page.js');
checkImports('app/admin/page.js');
checkImports('app/api/book/route.js');

console.log(`\n--- Verification Finished with ${errors} error(s) ---`);

if (errors === 0) {
  console.log("🚀 Everything looks perfect! You are ready to push to GitHub.");
} else {
  console.log("🛠️ Please fix the errors above before pushing.");
}