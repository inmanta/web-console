import React from "react";
import { ResourceModel } from "@/Core";
import { Table, TableHeader, TableBody } from "@patternfly/react-table";
import { Button } from "@patternfly/react-core";
import {
  ExternalLinkAltIcon,
  CheckSquareIcon,
  TimesCircleIcon,
} from "@patternfly/react-icons";
import { HrefCreator } from "./HrefCreator";
import { words } from "@/UI/words";

interface Props {
  hrefCreator: HrefCreator;
  resources: ResourceModel[];
  "aria-label"?: string;
  id?: string;
}

export const ResourceTable: React.FC<Props> = ({
  hrefCreator,
  resources,
  id,
  ...props
}) => {
  const columns = ["Resource Id", "Details", "State"];
  const rows = resources.map((resource) => {
    const href = hrefCreator.create(resource.resource_id);
    const linkToDetails = (
      <Button
        component="a"
        variant="link"
        isInline={true}
        icon={<ExternalLinkAltIcon />}
        href={href}
        target="_blank"
      >
        {words("inventory.resourcesTab.detailsLink")}
      </Button>
    );

    return {
      cells: [
        resource.resource_id,
        { title: linkToDetails },
        { title: <Status state={resource.resource_state} /> },
      ],
    };
  });

  return (
    <Table cells={columns} rows={rows} aria-label={props["aria-label"]}>
      <TableHeader id={id ? `resource-table-header-${id}` : undefined} />
      <TableBody />
    </Table>
  );
};

const Status: React.FC<{ state: string }> = ({ state }) => {
  switch (state) {
    case "deployed":
      return (
        <>
          <CheckSquareIcon color="#06c" /> {state}
        </>
      );
    case "failed":
      return (
        <>
          <TimesCircleIcon color="#c9190b" /> {state}
        </>
      );
    default:
      return <>{state}</>;
  }
};
