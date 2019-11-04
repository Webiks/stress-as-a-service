#!/bin/bash
eval $(aws ecr get-login --no-include-email --region us-west-2)

docker tag webiks/cron_server:latest 223455578796.dkr.ecr.us-west-2.amazonaws.com/monitor-stress:latest
docker push 223455578796.dkr.ecr.us-west-2.amazonaws.com/monitor-stress:latest
