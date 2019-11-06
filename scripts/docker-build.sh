#!/bin/bash
PACKAGE_VERSION=$(node -p "require('./package.json').version")
docker build . -t webiks/cron_server:"$PACKAGE_VERSION"
