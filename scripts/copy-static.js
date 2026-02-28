// scripts/copy-static.js
// Post-build helper: copies static assets into .next/standalone/ and
// resolves all symlinks so electron-builder can package without admin rights.
const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`[copy-static] Source not found, skipping: ${src}`);
    return;
  }
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Resolve symlinks in a directory by replacing them with copies of their targets.
// Uses fs.cpSync with dereference:true which follows symlinks and copies content.
function resolveSymlinksInDir(dir) {
  if (!fs.existsSync(dir)) return;

  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isSymbolicLink()) {
      let target;
      try {
        target = fs.realpathSync(fullPath);
      } catch {
        // Broken symlink — remove it
        try { fs.unlinkSync(fullPath); } catch {}
        continue;
      }

      try {
        // Remove the symlink
        fs.unlinkSync(fullPath);
        // Copy the real target content in its place
        const stat = fs.statSync(target);
        if (stat.isDirectory()) {
          fs.cpSync(target, fullPath, { recursive: true, dereference: true });
        } else {
          fs.copyFileSync(target, fullPath);
        }
      } catch (err) {
        console.warn(`[copy-static] Could not resolve symlink ${fullPath}: ${err.message}`);
      }
    } else if (entry.isDirectory()) {
      resolveSymlinksInDir(fullPath);
    }
  }
}

const root = path.join(__dirname, '..');
const standalone = path.join(root, '.next', 'standalone');

if (!fs.existsSync(standalone)) {
  console.error('[copy-static] .next/standalone not found. Did you run "next build"?');
  process.exit(1);
}

console.log('[copy-static] Copying static assets into standalone...');

// 1. .next/static/ → .next/standalone/.next/static/
copyDir(
  path.join(root, '.next', 'static'),
  path.join(standalone, '.next', 'static')
);
console.log('[copy-static] ✓ .next/static');

// 2. public/ → .next/standalone/public/
copyDir(
  path.join(root, 'public'),
  path.join(standalone, 'public')
);
console.log('[copy-static] ✓ public/');

// 3. templates/ → .next/standalone/templates/
copyDir(
  path.join(root, 'templates'),
  path.join(standalone, 'templates')
);
console.log('[copy-static] ✓ templates/');

// 4. Resolve all symlinks in standalone so electron-builder doesn't need admin rights
//    (Next.js creates symlinks pointing to node_modules, pnpm creates symlinks too)
console.log('[copy-static] Resolving symlinks in standalone (this may take a moment)...');
resolveSymlinksInDir(path.join(standalone, 'node_modules'));
resolveSymlinksInDir(path.join(standalone, '.next', 'node_modules'));
console.log('[copy-static] ✓ Symlinks resolved');

console.log('[copy-static] Done.');
