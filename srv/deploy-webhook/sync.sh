#!/usr/bin/env bash

cd ../..
git fetch
git checkout origin/master
make frontend-install
make frontend-build
