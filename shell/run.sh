#!/bin/bash

echo "=> Vulcan - Runtime"
cdir="$(dirname "$0")"

# Lib Imports
source "$cdir/lib/vars.sh"

# Prompt
echo "Select Vulcan execution?"
options=("Regular Start" "Development Start" "Production Start (recommended)" "Destroy current production")

select opt in "${options[@]}"
do
    case $opt in
        "Regular Start")
            npm run start
            break;;
        "Development Start")
            npm run dev
            break;;
        "Production Start (recommended)")
            npm run production
            break;;
        "Destroy current production")
            npm run production:delete
            break;;
        *) echo "invalid option $REPLY";;
    esac
done
