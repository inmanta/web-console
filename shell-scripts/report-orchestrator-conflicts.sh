# Lists what on this machine holds a container name, port or network range that the orchestrator
# setup needs, with who owns it, so a setup that fails on a conflict shows why in the log.
# Run it after clear-server.sh: by then nothing of ours (Compose project `local-setup`) is left,
# so whatever it lists belongs to someone else. It removes nothing and always exits 0.

NAMES="inmanta_orchestrator inmanta_db keycloak mock_oauth2_server inmanta_db_init_admin_user inmanta_server_create_users_and_roles"
PORTS="8888 8080"
# The subnet of local-setup's network is 172.30.0.0/16.
SUBNET_PREFIX="172.30."
CONTAINER_FORMAT='{{.Names}}  status: {{.Status}}  created: {{.CreatedAt}}  project: {{.Label "com.docker.compose.project"}}  folder: {{.Label "com.docker.compose.project.working_dir"}}'

found=0

# report <what> <lines>: prints the lines under a heading, if there are any.
report() {
    [ -z "$2" ] && return
    if [ "$found" -eq 0 ]; then
        echo "Orchestrator conflicts on $(hostname): not created by our setup, so left alone. The setup may fail on them:"
        found=1
    fi
    echo "- $1:"
    echo "$2" | sed 's/^/    /'
}

for name in $NAMES; do
    report "container name $name" "$(docker ps -a --filter "name=^${name}\$" --format "$CONTAINER_FORMAT")"
done

for port in $PORTS; do
    report "port $port" "$(docker ps --filter "publish=${port}" --format "$CONTAINER_FORMAT")"
done

for network in $(docker network ls -q); do
    docker network inspect --format '{{.Name}} {{range .IPAM.Config}}{{.Subnet}} {{end}}' "$network"
done | while read -r name subnets; do
    case " $subnets" in
        *" $SUBNET_PREFIX"*)
            containers=$(docker ps -a --filter "network=${name}" --format "$CONTAINER_FORMAT")
            if [ -z "$containers" ]; then
                containers="no containers: stale, \`docker network rm ${name}\` removes it"
            fi
            project=$(docker network inspect --format '{{index .Labels "com.docker.compose.project"}}' "$name")
            report "network $name ($subnets) of project '${project}', which overlaps local-setup's 172.30.0.0/16" "$containers"
            ;;
    esac
done

exit 0
