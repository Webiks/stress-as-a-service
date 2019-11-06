'use strict';

const fs = require('fs');
const uuid = require('uuid/v4');
const {Router} = require('express');

const config = require('../../config/config.json');
const stressTests = require('../../config/stressTests');
const cronHandler = require('../handlers/cronHandler');
const storage = require('../handlers/storageHandler');

const router = Router();

const command = config.task.command;
const fileName = './config/' + config.server.cronJobFile;

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
   const id = uuid();
  const task = cronHandler.setCron(exp, command, args);
  storage.set(id, task);
  addCronJobToFile( { id: id, exp: task.exp, args: task.args});
  return res.json({ pid: task.processId, id: id, exp: task.exp, args: task.args });
});

router.delete('/stress', (req, res) => {
  const tasks = [];
  storage.forEach((task, id) => {
    tasks.push( { pid: task.processId, id: id, exp: task.exp, args: task.args } );
    task.scheduledTask.destroy();
    console.log(`${(new Date()).toISOString()} Cron id ${id} with exp ${task.exp} and args ${task.args} has been deleted`);
    storage.delete(id);
    removeCronJobFromFile(id);
  });
  return res.json({ operation: 'Delete all tasks', tasks: tasks });
});

router.delete('/stress/:id', (req, res) => {
  const id = req.params.id;
  if (storage.has(id)) {
    const task = storage.get(id);
    task.scheduledTask.destroy();
    console.log(`${(new Date()).toISOString()} Cron id ${id} with exp ${task.exp} and args ${task.args} has been deleted`);
    storage.delete(id);
    removeCronJobFromFile(id);
    return res.json({ operation: 'Delete a task', pid: task.processId, id: id, exp: task.exp, args: task.args });
  }
  else
    return res.status(404).send(`id [${id}] not found!`);
});

function addCronJobToFile(obj) {
  stressTests.push(obj);
  fs.writeFileSync(fileName, JSON.stringify(stressTests, null, 2));
}

function removeCronJobFromFile(id) {
  const arr = stressTests.filter( (obj) => {
    return obj.id !== id
  });
  fs.writeFileSync(fileName, JSON.stringify(arr, null, 2));
}

module.exports = router;
