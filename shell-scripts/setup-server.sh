echo "Starting E2E test suit"

# Arg $1 is the OS you are on
# Arg $2 is the version of the orchestrator that is being pulled/installed.

if [[ -f "./shell-scripts/env.sh" ]]; then
    echo "env.sh found - sourcing..."
    # shellcheck disable=SC1091
    source ./shell-scripts/env.sh
    local_setup_repo=https://demo:$GITLAB_TOKEN@code.inmanta.com/inmanta/local-setup.git
else
    echo "No env.sh file found, checking for GITLAB_TOKEN variable instead"
    if [ -n "$GITLAB_TOKEN" ]; then
    echo "GITLAB_TOKEN successfuly found."
    local_setup_repo=https://jenkins:$GITLAB_TOKEN@code.inmanta.com/inmanta/local-setup.git
    else
    echo "GITLAB_TOKEN variable not supplied."
    exit 1
    fi
fi

mkdir temp
cd temp

git clone $local_setup_repo || exit 1

cd local-setup

# This can be adjusted to pull in iso4 by replacing the second argument with '4dev'
yarn run pull:$2

sleep 2

# command from the local-setup repo to docker compose up.
chmod +x resources/load_db_dump.sh
yarn start

# need to sleep to avoid concurency with the next command execution. Under 4 sec it doesn't work locally.
for i in {0..30}; do curl --connect-timeout 1 http://localhost:8888/api/v1/serverstatus > /dev/null && echo "Server up " && break; echo "Waiting $i"; sleep 1; done && [[ $i == 30 ]] && exit 1
# execute installation script for LSM
yarn $1:lsm:install

# exit temp/local-setup to be back on root level
cd ../..

# remove old build output and copy dist to the the orchestrator
docker exec inmanta_orchestrator rm -rf /usr/share/inmanta/web-console

docker cp dist inmanta_orchestrator:/usr/share/inmanta/web-console
