'use strict';

const uuid = require('uuid/v4');
const {Router} = require('express');
const cron = require('node-cron');

const config = require('../../config/config.json');
const logger = require('../modules/logger');
const execute = require('../handlers/cronHendler');
const storage = require('../handlers/storageHendler');

const router = Router();

const command = config.task.command;



router.get('/stress', (req, res) => {
  const tasks = [];
  storage.forEach((task, id) => {
    tasks.push({ pid: task.processId, id: id, exp: task.exp, args: task.args });
  });
  return res.send({ operation: 'Get all tasks', tasks: tasks });
});

router.get('/stress/:id', (req, res) => {
  const id = req.params.id;
  if (storage.has(id)) {
    const task = storage.get(id);
    return res.json({ operation: 'Get a task', pid: task.processId, id: id, exp: task.exp, args: task.args });
  }
  else
    return res.status(404).send(`id [${id}] not found!`);
});

router.post('/stress/?', (req, res) => {
  if (!req.query.exp) {
    return res.status(400).send('EXP (cron expression) is a required query parameter');
  }
  if (!req.query.args) {
    return res.status(400).send('ARGS is a required query parameter');
  }
  const exp = req.query.exp.toString();
  const args = req.query.args.toString();
  let processId = undefined;
  const scheduledTask = cron.schedule(exp,
    () => {
      execute(command, args)
        .then( (pid) => {
          processId = pid;
          console.log(`${(new Date()).toISOString()} Spawning new task w/ PID ${pid} Exp ${exp}, Id:[${id}] and arguments < ${args} >`);
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
  const id = uuid();
  storage.set(id, task);
  return res.json({ pid: processId, id: id, exp: exp, args: args });
});

router.delete('/stress', (req, res) => {
  const tasks = [];
  storage.forEach((task, id) => {
    tasks.push( { pid: task.processId, id: id, exp: task.exp, args: task.args } );
    task.scheduledTask.destroy();
    storage.delete(id);
  });
  return res.json({ operation: 'Delete all tasks', tasks: tasks });
});

router.delete('/stress/:id', (req, res) => {
  const id = req.params.id;
  if (storage.has(id)) {
    const task = storage.get(id);
    task.scheduledTask.destroy();
    storage.delete(id);
    return res.json({ operation: 'Delete a task', pid: task.processId, id: id, exp: task.exp, args: task.args });
  }
  else
    return res.status(404).send(`id [${id}] not found!`);
});

module.exports = router;
