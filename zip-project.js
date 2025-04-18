
#!/usr/bin/env node

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import util from 'util';

const execPromise = util.promisify(exec);

async function zipProject() {
  try {
    console.log("Creating temporary directory for archives...");
    await execPromise('mkdir -p ./zips');
    
    // Clean up any existing archive files
    await execPromise('rm -f ./zips/okkyno_part_*.tar.gz');
    
    // Create a list of directories/files to exclude
    const excludeList = [
      '--exclude=./node_modules',
      '--exclude=./.git',
      '--exclude=./zips',
      '--exclude=./dist',
      '--exclude=./build'
    ].join(' ');
    
    // First create a single tar.gz file of everything
    console.log("Creating full project archive...");
    await execPromise(`tar -czf ./zips/okkyno_full.tar.gz ${excludeList} .`);
    
    // Get the size of the archive
    const stats = fs.statSync('./zips/okkyno_full.tar.gz');
    const fileSizeMB = stats.size / (1024 * 1024);
    console.log(`Archive size: ${fileSizeMB.toFixed(2)} MB`);
    
    // Now split it into 50MB chunks
    console.log("Splitting into 50MB chunks...");
    await execPromise('cd zips && split -b 50M okkyno_full.tar.gz "okkyno_part_"');
    
    // Remove the original large archive file
    await execPromise('rm ./zips/okkyno_full.tar.gz');
    
    // Rename the split files to have .tar.gz extension
    const files = fs.readdirSync('./zips');
    for (const file of files) {
      if (file.startsWith('okkyno_part_')) {
        fs.renameSync(`./zips/${file}`, `./zips/${file}.tar.gz`);
      }
    }
    
    // Get file sizes and count
    const archiveFiles = fs.readdirSync('./zips')
      .filter(file => file.endsWith('.tar.gz'))
      .map(file => ({
        name: file,
        size: (fs.statSync(`./zips/${file}`).size / (1024 * 1024)).toFixed(2) // Size in MB
      }));
    
    console.log("\nArchive files created successfully!");
    console.log("------------------------------");
    archiveFiles.forEach((file, index) => {
      console.log(`${index + 1}. ${file.name} (${file.size} MB)`);
    });
    console.log("\nFiles are located in the './zips' directory");
    console.log("\nTo combine these files later:");
    console.log("1. Place all parts in the same directory");
    console.log("2. Run: cat okkyno_part_* > okkyno_full.tar.gz");
    console.log("3. Extract with: tar -xzf okkyno_full.tar.gz");
  } catch (error) {
    console.error("Error during archive process:", error);
  }
}

zipProject();
