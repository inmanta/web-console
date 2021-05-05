import React, { useState, useContext } from "react";
import { Failure } from "@/Core";
import { words } from "@/UI/words";
import { DependencyContext } from "@/UI/Dependency";
import {
  Card,
  CardActions,
  CardBody,
  CardHeader,
  CardTitle,
  Dropdown,
  KebabToggle,
} from "@patternfly/react-core";
import { DropdownExternalLink } from "./ExternalLink";

interface Props {
  failure: Failure;
}

export const FailureCard: React.FC<Props> = ({ failure }) => {
  const { urlManager } = useContext(DependencyContext);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownItems = [
    <DropdownExternalLink
      key="resourceDetailsLink"
      url={urlManager.getResourceUrl(failure.resource_id)}
      linkText={words("diagnose.links.resourceDetails")}
    />,
    <DropdownExternalLink
      key="modelVersionLink"
      url={urlManager.getModelVersionUrl(failure.model_version.toString())}
      linkText={words("diagnose.links.modelVersionDetails")}
    />,
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{words("diagnose.failure.title")}</CardTitle>
        <CardActions>
          <Dropdown
            onSelect={() => setIsOpen((value) => !value)}
            toggle={
              <KebabToggle onToggle={() => setIsOpen((value) => !value)} />
            }
            isOpen={isOpen}
            isPlain
            dropdownItems={dropdownItems}
            position={"right"}
          />
        </CardActions>
      </CardHeader>
      <CardTitle className="patternfly-text-gray">
        {failure.resource_id}
      </CardTitle>
      <CardBody>
        <pre>{failure.message}</pre>
      </CardBody>
    </Card>
  );
};
