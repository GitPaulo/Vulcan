#!/usr/bin/env bash

# Greetings
cat "./shell/ascii_logo.txt"

# Session Vars
bold=$(tput bold)
normal=$(tput sgr0)

# Check admin priv
net session > /dev/null 2>&1

if [ $? -eq 0 ]; then 
    echo "Administrator privileges detected."
else 
    echo "No administrator privileges detected."
    echo "${bold}Execute this script with an adminstrative terminal."
    exit
fi

echo "Installing system prerequisites."
source ~/.nvm/nvm.sh

# NVM
if ! command -v nvm > /dev/null; then
    echo "Installing nvm."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
    echo "NVM requires terminal restart."
    echo "${bold}Run this script agian!"
    exit
else
    echo "Skipping installation: nvm already found."
fi

# Node.js
if ! which npm > /dev/null; then
    echo "Installing node.js."
    nvm install --lts
else
    echo "Skipping installation: node already found."
fi

# OS dependent prereq
if [[ "$OSTYPE" == "linux-gnu" ]]; then
    echo "Refereshing and updating packages."
    apt update
    apt upgrade
    echo "Beggining to install packages."
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
elif [[ "$OSTYPE" == "msys" ]]; then
    # node gyp might complain (VS 2017 + Desktop dev C++ package)
    echo "Installing windows build tools."
    npm i windows-build-tools --production --vs2015 --add-python-to-PATH --global
else
    echo "Unsupported os detected."
    echo "${bold}Installation script incompatible!"
    exit
fi

# Finish off strong
echo "Finally, installing local npm dependencies..."
npm install
echo "${bold}Vulcan installation DONE!"
