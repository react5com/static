#!/usr/bin/env node
import { renderStatic } from '../index.js';
import path from 'path';

if (process.argv < 4) {
  console.error('Usage: express-static-build <source> <destination> [--config esb.config.json] [--verbose]');
  process.exit(1);
}

const args = process.argv.slice(2);

const configIndex = args.indexOf('--config') !== -1 ? args.indexOf('--config') : args.indexOf('-c');
const verboseIndex = args.indexOf('--verbose') !== -1 ? args.indexOf('--verbose') : args.indexOf('-v');

const config = configIndex !== -1 ? args[configIndex + 1] : 'esb.config.json';
const verbose = verboseIndex !== -1;

if (verbose) args.splice(verboseIndex, 1);

const srcArg = args[0];
const destArg = args[1];

const srcPath = path.resolve(process.cwd(), srcArg);
const destPath = path.resolve(process.cwd(), destArg);
const configPath = path.resolve(process.cwd(), config);

renderStatic(srcPath, destPath, configPath, verbose);