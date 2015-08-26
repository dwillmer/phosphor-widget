#!/bin/bash
export DISPLAY=:99.0
sh -e /etc/init.d/xvfb start
set -e
npm run clean
npm run build
npm test
npm run docs
