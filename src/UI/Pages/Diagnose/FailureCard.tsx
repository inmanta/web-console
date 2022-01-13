import React, { useState } from "react";
import {
  Card,
  CardActions,
  CardBody,
  CardHeader,
  CardTitle,
  Dropdown,
  DropdownItem,
  KebabToggle,
} from "@patternfly/react-core";
import styled from "styled-components";
import { Failure } from "@/Core";
import { useNavigateTo } from "@/UI/Routing";
import { greyText } from "@/UI/Styles";
import { getResourceIdFromResourceVersionId } from "@/UI/Utils";
import { words } from "@/UI/words";
import { Pre } from "./Pre";

interface Props {
  resourceId: string;
  failure: Failure;
}

export const FailureCard: React.FC<Props> = ({ resourceId, failure }) => {
  const navigateTo = useNavigateTo();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownItems = [
    <DropdownItem
      key="resourceDetailsLink"
      onClick={() =>
        navigateTo("ResourceDetails", {
          resourceId: getResourceIdFromResourceVersionId(resourceId),
        })
      }
    >
      {words("diagnose.links.resourceDetails")}
    </DropdownItem>,
    <DropdownItem
      key="modelVersionLink"
      onClick={() =>
        navigateTo("DesiredStateDetails", {
          version: failure.model_version.toString(),
        })
      }
    >
      {words("diagnose.links.modelVersionDetails")}
    </DropdownItem>,
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
