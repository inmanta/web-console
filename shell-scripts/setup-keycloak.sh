#!/usr/bin/env bash
set -e

# parse arguments
for ARGUMENT in "$@"
do
   KEY=$(echo $ARGUMENT | cut -f1 -d=)

   KEY_LENGTH=${#KEY}
   VALUE="${ARGUMENT#*=}"

   declare "$KEY"="$VALUE"
done

# Check if the gitlab token is present.
if [[ -f "./shell-scripts/env.sh" ]]; then
    echo "env.sh found - sourcing..."
    # shellcheck disable=SC1091
    source ./shell-scripts/env.sh
    LOCAL_SETUP_REPO=https://demo:$GITLAB_TOKEN@code.inmanta.com/inmanta/local-setup.git
else
    echo "No env.sh file found, checking for GITLAB_TOKEN variable instead"
    if [ -n "$GITLAB_TOKEN" ]; then
    echo "GITLAB_TOKEN successfuly found."
    LOCAL_SETUP_REPO=https://jenkins:$GITLAB_TOKEN@code.inmanta.com/inmanta/local-setup.git
    else
    echo "GITLAB_TOKEN variable not supplied."
    exit 1
    fi
fi

VERSION=${version:-iso}
RELEASE=${release:-7-dev}
BRANCH=${branch:-master}

echo "Creating temp folder..."
mkdir temp

echo "Cloning the local-setup repo in the temp folder..."
cd temp && git clone $LOCAL_SETUP_REPO
cd local-setup

echo "Pulling $VERSION - $RELEASE"
yarn run pull $VERSION $RELEASE

sleep 2
echo "Starting container..."
yarn start:keycloak

for i in {0..30} 
do 
    curl -k --connect-timeout 1 https://localhost:8888/api/v1/serverstatus > /dev/null && echo "Server up " && break
    echo "Waiting $i"
    sleep 1 
done && [[ $i == 30 ]] && exit 1
