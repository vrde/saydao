#!/usr/bin/env bash

cd ../..
git fetch
git checkout origin/master
make deploy-frontend
