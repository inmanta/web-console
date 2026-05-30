#!/usr/bin/env bash
# Alternative entrypoint for the node container.
# It starts a code-server to allow easy access to the web console state directory.

set -x
set -e
set -o allexport

## SETUP ##
# Make sure that any environment variable prefixed with NODE which is available
# to the container, will also be available to the node user when login in
NODE_USER_HOME_DIR=$(getent passwd node | cut -d: -f6)
NODE_ENV_FILE="${NODE_USER_HOME_DIR}/.node_env"
NODE_PROFILE="${NODE_USER_HOME_DIR}/.profile"
LOAD_ENV_CMD=". $NODE_ENV_FILE"

# Overwrite environment variables in dedicated file
if export | grep VITE; then
    export | grep VITE >> $NODE_ENV_FILE
fi
if export | grep NPM; then
    export | grep NPM >> $NODE_ENV_FILE
fi

# Make sure to load environment variables when login in
touch $NODE_PROFILE
grep -e "$LOAD_ENV_CMD" "$NODE_PROFILE" || echo "$LOAD_ENV_CMD" >> "$NODE_PROFILE"

# Install sudo
apt-get update -y
apt-get install -y sudo vim tini

# Install the web-console dependencies
exec /usr/bin/tini -- sudo -i -u node bash <<EOF
cd web-console
yarn install
exec yarn start
EOF
