# Removes the orchestrator's containers, network and volumes, then the temp folder.
# Every orchestrator setup clones local-setup into temp/local-setup, so its Compose project is
# always `local-setup`. Removing that project by name needs no checkout, and it removes only
# what our setups created: other containers on the machine are left alone.
# Needs only sh and docker, so CI can clean up even when yarn doesn't work. Fails when docker does.
docker compose --project-name local-setup down --volumes --remove-orphans
status=$?
rm -rf temp
exit $status
