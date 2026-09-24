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
RELEASE=${release:-10-dev}
DOCKER_FLAG=${flag:-}
BRANCH=${branch:-master}
PROJECT_REPO=${project:-default}
CORE_BRANCH=${core:-}

if [[ "$VERSION" == "oss" ]]
then
    INSTALL_VERSION="oss"
else
    INSTALL_VERSION="lsm"
fi

echo "Creating temp folder..."
mkdir temp

echo "Cloning the local-setup repo in the temp folder..."
cd temp && git clone $LOCAL_SETUP_REPO
cd local-setup

echo "Pulling $VERSION - $RELEASE"
yarn run pull $VERSION $RELEASE

# Optionally swap inmanta-core in the pulled image for a branch from GitHub.
# docker-compose always starts the image tagged iso-image, so we rebuild that tag.
if [[ -n "$CORE_BRANCH" ]]
then
    echo "Installing inmanta-core from branch $CORE_BRANCH..."
    docker build -t iso-image - <<EOF
FROM iso-image
USER 0
RUN /opt/inmanta/bin/pip install https://github.com/inmanta/inmanta-core/archive/refs/heads/$CORE_BRANCH.tar.gz
RUN /opt/inmanta/bin/inmanta --help
USER inmanta:inmanta
EOF
fi

sleep 2
echo "Starting container..."
yarn start

for i in {0..30} 
do 
    curl --connect-timeout 1 http://localhost:8888/api/v1/serverstatus > /dev/null && echo "Server up " && break
    echo "Waiting $i"
    sleep 1 
done && [[ $i == 30 ]] && exit 1

echo "install $INSTALL_VERSION"
yarn install:orchestrator version=$INSTALL_VERSION flag=${DOCKER_FLAG} branch=${BRANCH} repo=${PROJECT_REPO}

# exit temp/local-setup to be back on root level
cd ../..

echo "Replace dist folder on the orchestrator with current build..."
# remove old build output and copy dist to the the orchestrator
docker exec -u root inmanta_orchestrator rm -rf /usr/share/inmanta/web-console

docker cp dist inmanta_orchestrator:/usr/share/inmanta/web-console

echo "The orchestrator has been setup."