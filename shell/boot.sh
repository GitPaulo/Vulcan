#!/usr/bin/env bash

# Greetings
cdir="$(dirname "$0")"
cat "$cdir/resources/ascii_banner.txt"

# Lib Imports
source "$cdir/lib/vars.sh"

# Order: required.sh >> this >> run.sh
source "$cdir/required.sh"

# Install project dependencies
echo "Finally, installing local npm dependencies..."
npm ci

# Build bot components & data
echo "Running components execution..."
npm run exec:components

# CI cant edit settings!
if [[ $RAN_BY_CI -eq "0" ]]; then
    # Check for settings update and finish!
    echo "Visit the new 'settings' folder and fill in credentials."
    while : ; do
        lmod=$(stat -c %y ./settings/credentials.yml)
        read -p "${bold}(REQUIRED) ${normal}Update and save settings file and then press enter to continue...."
        nmod=$(stat -c %y ./settings/credentials.yml)
        
        [[ $lmod == $nmod ]] || break;
    done
fi

echo "Vulcan installation: ${bold}COMPLETE.${normal}"

# Order: required.sh >> this >> run.sh
source "$cdir/run.sh"
