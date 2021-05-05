import { Failure } from "@/Core";
import { ResourceHrefCreatorImpl } from "@/UI/Components";
import { words } from "@/UI/words";
import {
  Card,
  CardActions,
  CardBody,
  CardHeader,
  CardTitle,
  Dropdown,
  KebabToggle,
} from "@patternfly/react-core";
import React, { useState } from "react";
import { DropdownExternalLink } from "./ExternalLink";
import { ModelVersionHrefCreator } from "@/UI/Components";

interface Props {
  failure: Failure;
  environment: string;
}

export const FailureCard: React.FC<Props> = ({ failure, environment }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hrefCreator = new ResourceHrefCreatorImpl(environment);
  const dropdownItems = [
    <DropdownExternalLink
      key="resourceDetailsLink"
      hrefCreator={hrefCreator}
      id={failure.resource_id}
      linkText={words("diagnose.links.resourceDetails")}
    />,
    <DropdownExternalLink
      key="modelVersionLink"
      hrefCreator={new ModelVersionHrefCreator(environment)}
      id={failure.model_version.toString()}
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
