'use strict';

const {spawn} = require('child_process');

module.exports = function execute(cmd, args) {
  return new Promise((resolve, reject) => {
    if (typeof (args) === 'string') {
      args = args.split(' ');
    }
    if (!(args instanceof Array)) {
      reject('Arguments must be string or array');
    }
    console.log(`${(new Date()).toISOString()} - Cmd: ${cmd}, Args: ${args}`);
    const process = spawn(cmd, args);
    process.on('exit', (code, signal) => {
      if (code === 0) {
        console.log(`${(new Date()).toISOString()} - Child process ${process.pid} exited with code ${code}`);
      } else {
        reject(`${(new Date()).toISOString()} - Child process ${process.pid} exit code: ${code}, exit signal: ${signal}`);
      }
    });
    process.stdout.setEncoding('utf8');
    process.stdout.on('data', (data) => {
      console.log(`${(new Date()).toISOString()} - stdout: ${data}`);
    });
    process.stderr.setEncoding('utf8');
    process.stderr.on('data', (data) => {
      console.log(`${(new Date()).toISOString()} - stdout: ${data}`);
    });
    resolve(process.pid);
  });
};
