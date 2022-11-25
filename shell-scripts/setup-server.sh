#!/bin/bash
echo "Starting E2E test suit"

# if [[ -f "./shell-scripts/env.sh" ]]; then
#     echo "env.sh found - sourcing..."
#     # shellcheck disable=SC1091
#     source ./shell-scripts/env.sh
#     local_setup_repo=https://demo:$GITLAB_TOKEN@code.inmanta.com/inmanta/local-setup.git
# else
#     echo "No env.sh file found, checking for GITLAB_TOKEN variable instead"
#     if [ -n "$GITLAB_TOKEN" ]; then
#     echo "GITLAB_TOKEN successfuly found."
#     local_setup_repo=https://jenkins:$GITLAB_TOKEN@code.inmanta.com/inmanta/local-setup.git
#     else
#     echo "GITLAB_TOKEN variable not supplied."
#     exit
#     fi
# fi


local_setup_repo=https://jenkins:$GITLAB_TOKEN@code.inmanta.com/inmanta/local-setup.git

mkdir temp
cd temp
git clone $local_setup_repo

if ![[ -f "local-setup"]]; then exit
cd local-setup

# pull either iso5 or iso4

yarn run pull:5dev

sleep 2

# command from the local-setup repo to docker compose up.
yarn start

# need to sleep to avoid concurency with the next command execution. Under 4 sec it doesn't work locally.
sleep 4

# execute installation script for LSM (there are two commands so in cleanup think about solution instead of copying the whole command)
yarn windows:lsm:install

# run test suit based on the docker that is being spinned up.
cd ../..

# remove old build output and copy dist to the the orchestrator
docker exec inmanta_orchestrator rm -rf /usr/share/inmanta/web-console

docker cp dist inmanta_orchestrator:/usr/share/inmanta/web-console