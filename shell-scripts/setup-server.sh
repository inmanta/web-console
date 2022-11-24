#!/bin/bash
echo "Starting E2E test suit"

if [[ -f "./env.sh" ]]; then
    echo "env.sh found - sourcing..."
    # shellcheck disable=SC1091
    source ./env.sh
else
    echo "No env.sh file found, please make sure to add it before running the script."
    echo "The variable PAT_GITLAB needs to be exported."
    exit
fi

local_setup_repo=https://demo:$PAT_GITLAB@code.inmanta.com/inmanta/local-setup.git

mkdir temp
cd temp
git clone $local_setup_repo

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

# yarn cypress run

# cleanup containers after running test suit.
# cd temp/local-setup
# yarn run kill:container

# delete temp folder that was created.
# cd ../..
# rm -rf temp