import { IResourceModel } from "@app/Models/LsmModels";
import React from "react";
import { Table, TableHeader, TableBody } from "@patternfly/react-table";
import { Button } from "@patternfly/react-core";
import { ExternalLinkAltIcon } from "@patternfly/react-icons";
import { useStoreState, State } from "easy-peasy";
import { IStoreModel } from "@app/Models/CoreModels";

const LENGTH_OF_VERSION_PREFIX = 3;

export const ResourceTable: React.FunctionComponent<{ resources: IResourceModel[] }> = props => {
  const columns = ["Resource Id", "Details", "State"];
  const instanceId = props.resources[0].instanceId;
  const environmentId = useStoreState((state: State<IStoreModel>) => (
    state.projects.environments.selectedEnvironmentId
  ));
  const rows = props.resources.map(resource => {
    const href = getHrefFromResourceId(environmentId, resource.resource_id);
    const linkToDetails = (
      <Button component="a" variant="link" isInline={true} icon={<ExternalLinkAltIcon />} href={href} target="_blank">
        Jump to Details
      </Button>);
    return {
      cells: [
        resource.resource_id,
        { title: linkToDetails },
        resource.resource_state
      ]
    }
  });

  return (
    <Table caption={`Resources for instance with id ${instanceId}`} cells={columns} rows={rows}>
      <TableHeader />
      <TableBody />
    </Table>
  );
}

function getHrefFromResourceId(environmentId, resourceId: string): string {
  const indexOfVersionSeparator = resourceId.lastIndexOf(',');
  const resourceName = resourceId.substring(0, indexOfVersionSeparator);
  const version = resourceId.substring(indexOfVersionSeparator + LENGTH_OF_VERSION_PREFIX, resourceId.length);
  const url = `${process.env.API_BASEURL}/dashboard/#!/environment/${environmentId}/version/${version}/${resourceName}`;
  return url;
}