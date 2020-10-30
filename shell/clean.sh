#!/bin/bash

# Clean npm things
echo "Cleaning npm repo..."
rm package-lock.json
rm -rf node_modules
echo "Cleaning complete."

# npm install prompt
echo "Do you wish to run npm install??"
select yn in "Yes" "No"; do
    case $yn in
        Yes ) eval "npm install"; break;;
        No ) exit;;
    esac
done
