import React, { useContext, useState } from "react";
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
import { Link } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { greyText } from "@/UI/Styles";
import { getResourceIdFromResourceVersionId } from "@/UI/Utils";
import { words } from "@/UI/words";
import { Failure } from "@S/Diagnose/Core/Domain";
import { Pre } from "./Pre";

interface Props {
  resourceId: string;
  failure: Failure;
}

export const FailureCard: React.FC<Props> = ({ resourceId, failure }) => {
  const { routeManager } = useContext(DependencyContext);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownItems = [
    <DropdownItem
      key="resourceDetailsLink"
      component={
        <Link
          pathname={routeManager.getUrl("ResourceDetails", {
            resourceId: getResourceIdFromResourceVersionId(resourceId),
          })}
        >
          {words("diagnose.links.resourceDetails")}
        </Link>
      }
    />,
    <DropdownItem
      key="modelVersionLink"
      component={
        <Link
          pathname={routeManager.getUrl("DesiredStateDetails", {
            version: failure.model_version.toString(),
          })}
        >
          {words("diagnose.links.modelVersionDetails")}
        </Link>
      }
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
