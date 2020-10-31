#!/usr/bin/env bash

# Greetings
cat "./shell/ascii_logo.txt"

# Session Vars
bold=$(tput bold)
normal=$(tput sgr0)

# Allowed OS
[ "$(expr substr $(uname -s) 1 5)" == "Linux" ] || [ "$(uname)" == "Darwin" ] && isLin=1 || isLin=0
[ "$(expr substr $(uname -s) 1 5)" == "MINGW" ] || [ "$(expr substr $(uname -s) 1 6)" == "CYGWIN" ] && isWin=1 || isWin=0

if [[ isLin -eq "0" ]] && [[ isWin -eq "0" ]]; then
    echo "Unsupported OS detected."
    exit;
fi

# Perminssions check
if [[ isWin -eq "1" ]]; then 
    # win perms check
    net session > /dev/null 2>&1

    if [ $? -eq 0 ]; then 
        echo "Administrator privileges detected."
    else 
        echo "No administrator privileges detected."
        echo "${bold}Execute this script with an adminstrative terminal."
        exit
    fi
elif [[ isLin -eq "1" ]]; then
    # sudo check
    if [ "$EUID" -ne 0 ]; then
        echo "No administrator privileges detected."
        echo "${bold}Execute this script with an adminstrative terminal."
        exit
    fi
fi

echo "Installing system prerequisites."
source ~/.nvm/nvm.sh

# NVM: To install node & npm
if ! command -v nvm > /dev/null; then
    echo "Installing nvm."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
    echo "NVM requires terminal restart."
    echo "${bold}Run this script agian!"
    exit
else
    echo "Skipping installation: nvm already found."
fi

# Node: To run the bot
if ! which npm > /dev/null; then
    echo "Installing node.js."
    nvm install --lts
else
    echo "Skipping installation: node already found."
fi

# OS dependent: Oh no no no
if [[ isLin -eq "1" ]]; then
    # Compiler tools
    if [ $(dpkg-query -W -f='${Status}' gcc g++ make build-essential 2>/dev/null | grep -c "ok installed") -eq 0 ]; then
        apt install gcc g++ make build-essential
    else
        echo "Skipping installation: gcc g++ make build-essential already found."
    fi
    # Python 2.7.
    if [ $(dpkg-query -W -f='${Status}' python 2.7. 2>/dev/null | grep -c "ok installed") -eq 0 ]; then
           apt install python2.7 python-pip
    else
        echo "Skipping installation: python 2.7. already found."
    fi
elif [[ isWin -eq "1" ]]; then
    # node gyp might complain (VS 2017 + Desktop dev C++ package)
    echo "Installing windows build tools."
    npm i windows-build-tools --production --vs2015 --add-python-to-PATH --global
fi

# Install project dependencies
echo "Finally, installing local npm dependencies..."
npm install

# Build bot components & data
echo "Running components execution..."
npm run exec:components

# CI cant edit settings!
if [[ $RAN_BY_CI -eq "0" ]]; then
    # Check for settings update and finish!
    echo "Visit the new 'settings' folder and fill in credentials."
    while : ; do
        lmod=$(stat -c %y ./settings/credentials.yml)
        read -p "Save new settings and press enter to continue...."
        nmod=$(stat -c %y ./settings/credentials.yml)
        
        [[ $lmod == $nmod ]] || break;
    done
fi

echo "${bold}Vulcan installation DONE!"
