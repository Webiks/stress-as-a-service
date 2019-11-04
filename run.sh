#!/bin/bash
cd /metricbeat-7.4.1-linux-x86_64
./metricbeat &
cd /user/app
npm start
