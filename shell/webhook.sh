# Usage: ./shell/webhook cmd1 cmd2
#!/bin/bash
COMMANDS=( "$@" )
WEBHOOK_KEY=`cat ./data/webhook_key.txt`

if test -z "$WEBHOOK_KEY" 
then
    echo "No webhook key found. Has the file been generated?"
    exit
fi

if [ ${#COMMANDS[@]} -eq 0 ]; 
then
    echo "No commands found. Please input wh commands as arguments."
    exit
fi

# Bash array => json array
str=""
str="${str}["

while [ $# -gt 0 ]; do
    x=${1//\\/\\\\}
    str="${str}\"${x//\"/\\\"}\""
    [ $# -gt 1 ] && str="${str}, "
    shift
done

CMD_ARRAY="${str}]"

# Test commands
curl -m 900 -d "{\"key\":\"$WEBHOOK_KEY\", \"cmds\":$CMD_ARRAY}" -X POST -k https://localhost
