'use strict';

const uuid = require('uuid/v4');
const express = require('express');
const bodyParser = require ('body-parser');
const cors = require ('cors');
const cron = require('node-cron');

const stressTests = require('../config/stressTests.json');
const config = require('../config/config.json');
const storage = require('./handlers/storageHendler');
const execute = require('./handlers/cronHendler');
const errorHandler = require('./modules/errorHandling');
const logger = require('./modules/logger');
const stress = require('./routes/stress');

const app = express();

const port = config.server.PORT;

const command = config.task.command;

// Application-Level Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(logger);
app.use(stress);

app.get('/health', (req, res) => {
  res.send('Server is up and running ...')
});


const tests = stressTests;
tests.forEach( (test) => {
  const exp = test.exp.toString();
  const args = test.args.toString();
  console.log(`Exp: ${exp}, Args: ${args}`);

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
  console.log(`${(new Date()).toISOString()} Id: ${id}, Exp: ${exp}, Args: ${args}`);
});


app.listen(port,
  () => console.log(`New Monitor Cron API server listening on port ${port}!`)
);
