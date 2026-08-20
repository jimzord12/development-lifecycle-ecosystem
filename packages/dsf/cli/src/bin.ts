#!/usr/bin/env node

import { runCli } from './cli.js';

const result = runCli(process.argv.slice(2), {
  cwd: process.cwd(),
  env: process.env,
  stdoutIsTty: Boolean(process.stdout.isTTY),
  stderrIsTty: Boolean(process.stderr.isTTY),
});

if (result.stdout.length > 0) {
  process.stdout.write(result.stdout);
}
if (result.stderr.length > 0) {
  process.stderr.write(result.stderr);
}

process.exitCode = result.exitCode;
