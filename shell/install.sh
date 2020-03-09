#!/bin/bash

# Check admin priv
net session > /dev/null 2>&1

if [ $? -eq 0 ]; then 
    echo "Administrator priviledges detected."
else 
    echo "No administrator priviledges detected. Please run this script with them."
    exit
fi

# Install vulcan system prereq
echo "Installing system prerequisites..."

NVM_OUTPUT=$(nvm --version)

if [[ "${NVM_OUTPUT:0:4}" != "0.35" ]]; then
    echo "Installing node.js..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
    echo "NVM requires terminal restart."
    echo "Run this script agian!"
    exit
fi

NODE_OUTPUT=$(node --version)

if [[ "${NODE_OUTPUT:0:3}" != "v12" ]]; then
    echo "Installing node.js..."
    nvm install --lts
fi

if [[ "$OSTYPE" == "linux-gnu" ]]; then
    echo "Refereshing and updating packages..."
    sudo apt update
    sudo apt upgrade
    echo "Installing python 2.7..."
    sudo apt install python2.7 python-pip
elif [[ "$OSTYPE" == "msys" ]]; then
    # node gyp might complain (VS 2017 + Desktop dev C++ package)
    echo "Installing windows build tools..."
    npm i windows-build-tools --production --vs2015 --add-python-to-PATH --global
else
    echo "Unsupported os detected. Closing..."
    exit
fi

echo "Finally, installing local npm dependencies..."
npm install
