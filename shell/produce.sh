#!/bin/bash
COMMIT_MESSAGE=${1:-"General update."}

# Master
echo "Pushing master branch changes.."
eval "git add ."
eval "git commit -m '$COMMIT_MESSAGE'"
eval "git push origin master"

# Production
echo "Beggining production branch update..."
eval "git checkout production"
eval "git pull origin master"
eval "git push origin production"
eval "git checkout master"

# Done
echo "DONE!" 