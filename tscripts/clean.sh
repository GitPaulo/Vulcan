#!/bin/bash

# (Paths are relative to dir of script exec)
echo "Cleaning npm repo.."
eval "rm package-lock.json"
eval "rm -rf node_modules"
eval "npm install"
echo "Cleaning complete."
