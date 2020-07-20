#!/usr/bin/env bash

cd ../..
git fetch
git checkout origin/master
NETWORK=kovan make frontend-install frontend-build
# make frontend-deploy
