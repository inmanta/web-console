#!/bin/bash
echo "Setting up Orchestrator"
echo "for : " + $2 + $3

# Arg $1 is the OS you are on, can be either "linux", "windows"
# Arg $2 is either "oss" or "iso" or "url".
# Arg $3 is the tag or full url of the version you want to pull in.

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

echo "creating temp dir and cloning local-setup repo"

mkdir temp
cd temp

git clone $local_setup_repo || exit 1

echo "local-setup repo cloned succesfuly"

cd local-setup

yarn run pull $2 $3

yarn run start

echo "checking for status server"

for i in {0..30}; do curl --connect-timeout 1 http://localhost:8888/api/v1/serverstatus > /dev/null && echo "Server up " && break; echo "Waiting $i"; sleep 1; done && [[ $i == 30 ]] && exit 1

if [[ $2 = "iso" ]]
then
    echo "Installing ISO version with LSM"
    yarn run $1:lsm:install
elif [[ $2 = "oss" ]]
then 
    echo "Installing OSS version"
    yarn run $1:oss:install
else
    echo "You provided an url for the orchestrator, please run the install command you wish to use manually."
    exit 0
fi

# exit temp/local-setup to be back on root level
cd ../..

# remove old build output and copy dist to the the orchestrator
docker exec inmanta_orchestrator rm -rf /usr/share/inmanta/web-console

docker cp dist inmanta_orchestrator:/usr/share/inmanta/web-console
