import React, { useState, useContext } from "react";
import styled from "styled-components";
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
import { Failure } from "@/Core";
import { words } from "@/UI/words";
import { DependencyContext } from "@/UI/Dependency";
import { greyText } from "@/UI/Styles";
import { DropdownExternalLink } from "./ExternalLink";
import { Pre } from "./Pre";
import { Link } from "@/UI/Components/Link";
import { getResourceIdFromResourceVersionId } from "@/UI/Utils";

interface Props {
  resourceId: string;
  failure: Failure;
}

export const FailureCard: React.FC<Props> = ({ resourceId, failure }) => {
  const { urlManager, routeManager } = useContext(DependencyContext);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownItems = [
    <Link
      key="resourceDetailsLink"
      pathname={routeManager.getUrl("ResourceDetails", {
        resourceId: getResourceIdFromResourceVersionId(resourceId),
      })}
      envOnly
    >
      <StyledLink style={{ color: "var(--pf-global--link--Color)" }}>
        {words("diagnose.links.resourceDetails")}
      </StyledLink>
    </Link>,
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

const StyledLink = styled(DropdownItem)`
  color: var(--pf-global--link--Color);
`;
