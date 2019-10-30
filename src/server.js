'use strict';


const express = require('express');
const bodyParser = require ('body-parser');
const cors = require ('cors');

const config = require('../config/config.json');
const errorHandler = require('./modules/errorHandling');
const logger = require('./modules/logger');
const stress = require('./routes/stress');

const app = express();

const port = config.server.PORT;

// Application-Level Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(logger);
app.use(stress);

app.get('/health', (req, res) => {
  res.send('Server is up and running ...')
});

app.listen(port,
  () => console.log(`New Monitor Cron API server listening on port ${port}!`)
);
