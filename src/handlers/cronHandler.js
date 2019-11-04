'use strict';

const uuid = require('uuid/v4');
const cron = require('node-cron');

const stressTests = require('../../config/stressTests.json');
const config = require('../../config/config.json');
const storage = require('./storageHandler');

const {spawn} = require('child_process');

function execute(cmd, args) {
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

function setCron(exp, command, args) {
  let processId = undefined;
  const scheduledTask = cron.schedule(exp,
    () => {
      execute(command, args)
        .then((pid) => {
          processId = pid;
          console.log(`${(new Date()).toISOString()} Spawning new task w/ PID ${pid} and Stress arguments < ${args} >`);
        })
        .catch((err) => {
          console.log(`${(new Date()).toISOString()}`, err.stack);
        });
    },
    {
      scheduled: config.cron.options.scheduled,
      timezone: config.cron.options.timezone
    }
  );
  const task = {
    processId,
    scheduledTask,
    exp,
    args
  };
  return task;
}

function onload() {
  const command = config.task.command;
  const tests = stressTests;
  tests.forEach((test) => {
    const exp = test.exp.toString();
    const args = test.args.toString();
    console.log(`Exp: ${exp}, Args: ${args}`);
    const task = setCron(exp, command, args);
    const id = uuid();
    storage.set(id, task);
    console.log(`${(new Date()).toISOString()} Id: ${id}, Exp: ${exp}, Args: ${args}`);
  });
};

module.exports = {setCron, onload};
