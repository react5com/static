import fs, { promises as fsp } from 'fs';
import path from 'path';
import request from 'supertest';

async function fetchAndSave({ app, outputDir, route, file }) {
  try {
    const res = await request(app).get(route);
    const outputPath = path.join(outputDir, file);
    await fsp.writeFile(outputPath, res.text, 'utf8');
    console.log(`Saved ${file}`);
  } catch (err) {
    console.error(`Error fetching ${route}:`, err);
  }
}

async function copyFolder(src, dest) {
  await fsp.mkdir(dest, { recursive: true });
  const entries = await fsp.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyFolder(srcPath, destPath);
    } else {
      await fsp.copyFile(srcPath, destPath);
    }
  }
}

async function copyAssets(folders, srcDir, destDir) {
  for (const folder of folders) {
    const src = path.join(srcDir, folder);
    const dest = path.join(destDir, folder);
    // copy folder recursively
    await copyFolder(src, dest);
    console.log(`Copied assets from ${src} to ${dest}`);
  }
}

async function renderStaticInternal(source, destination, configPath, verbose) {
  if (!fs.existsSync(destination)) {
    await fsp.mkdir(destination);
  }
  const { app } = await import(path.join(source, "index.mjs"));
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const { routes, languages, assetFolders } = config;
  for (const item of routes) {
    for (const lang of languages) {
      const langDir = path.join(destination, lang);
      if (!fs.existsSync(langDir)) {
        await fsp.mkdir(langDir);
      }
      await fetchAndSave({app, outputDir: destination, route: `/${lang}/${item}`, file: `${lang}/${item || 'index'}.html`});
    }
    await fetchAndSave({app, outputDir: destination, route: `/${item}`, file: `${item || 'index'}.html`});
  }

  await copyAssets(assetFolders, source, destination);
  
  if (verbose)
    console.log('Static HTML build complete.');
}

// function copyFileSync(source, target, verbose) {
//   let targetFile = target;

//   if (fs.existsSync(target)) {
//     if (fs.lstatSync(target).isDirectory()) {
//       targetFile = path.join(target, path.basename(source));
//     }
//   }
//   fs.writeFileSync(targetFile, fs.readFileSync(source));
//   if (verbose) console.log(`Copied file from "${source}" to "${targetFile}" successfully.`);
// }

// function copyFolderRecursiveSync(source, target, isRoot = true, changedFilePath, verbose) {
//   let files = [];
//   const targetFolder = isRoot ? target : path.join(target, path.basename(source));
//   if (!fs.existsSync(targetFolder)) {
//     fs.mkdirSync(targetFolder);
//   }

//   if (fs.lstatSync(source).isDirectory()) {
//     files = fs.readdirSync(source);
//     files.forEach(function (file) {
//       const curSource = path.join(source, file);
//       if (fs.lstatSync(curSource).isDirectory()) {
//         copyFolderRecursiveSync(curSource, targetFolder, false, changedFilePath, verbose);
//       } else {
//         if (!changedFilePath || changedFilePath === curSource)
//           copyFileSync(curSource, targetFolder, verbose);
//       }
//     });
//   }
// }

export function renderStatic(source, destination, configPath, verbose) {
  const isSourceExists = fs.existsSync(source);
  if (!isSourceExists) {
    console.error(`Source path "${source}" does not exist.`);
    process.exit(1);
  }

  renderStaticInternal(source, destination, configPath, verbose)
    .then(() => process.exit(0))
    .catch((reason) => {
      console.error(reason);
      process.exit(1)
    });
  if (verbose) console.log(`Copied from "${source}" to "${destination}" successfully.`);
}