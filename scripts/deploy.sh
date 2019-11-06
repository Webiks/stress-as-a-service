#!/bin/bash
eval "$(aws ecr get-login --no-include-email --region us-west-2)"

PACKAGE_VERSION=$(node -p "require('./package.json').version")
docker tag webiks/cron_server:"$PACKAGE_VERSION" 223455578796.dkr.ecr.us-west-2.amazonaws.com/monitor-stress:"$PACKAGE_VERSION"
docker tag webiks/cron_server:latest 223455578796.dkr.ecr.us-west-2.amazonaws.com/monitor-stress:latest
docker push 223455578796.dkr.ecr.us-west-2.amazonaws.com/monitor-stress:latest
docker push 223455578796.dkr.ecr.us-west-2.amazonaws.com/monitor-stress:"$PACKAGE_VERSION"
