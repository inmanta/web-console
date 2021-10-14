import React, { useState, useContext } from "react";
import styled from "styled-components";
import {
  Card,
  CardActions,
  CardBody,
  CardHeader,
  CardTitle,
  Dropdown,
  KebabToggle,
} from "@patternfly/react-core";
import { Failure } from "@/Core";
import { words } from "@/UI/words";
import { DependencyContext } from "@/UI/Dependency";
import { greyText } from "@/UI/Styles";
import { DropdownExternalLink } from "./ExternalLink";
import { Pre } from "./Pre";

interface Props {
  resourceId: string;
  failure: Failure;
}

export const FailureCard: React.FC<Props> = ({ resourceId, failure }) => {
  const { urlManager } = useContext(DependencyContext);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownItems = [
    <DropdownExternalLink
      key="resourceDetailsLink"
      url={urlManager.getResourceUrl(resourceId)}
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
      <StyledCardTitle>{resourceId}</StyledCardTitle>
      <CardBody>
        <Pre>{failure.message}</Pre>
      </CardBody>
    </Card>
  );
};

const StyledCardTitle = styled(CardTitle)`
  ${greyText};
`;
