import React, { useState, useContext } from "react";
import styled from "styled-components";
import { Rejection } from "@/Core";
import { words } from "@/UI/words";
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
import { DependencyContext } from "@/UI/Dependency";
import { DropdownExternalLink } from "./ExternalLink";
import { Traceback } from "./Traceback";
import { greyText } from "@/UI/Styles";
import { getUrl } from "@/UI/Routing";
import { Link } from "react-router-dom";

interface Props {
  rejection: Rejection;
}

export const RejectionCard: React.FC<Props> = ({ rejection: rejection }) => {
  const { urlManager } = useContext(DependencyContext);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownItems: React.ReactNode[] = [
    <DropdownItem
      key="compileReportLink"
      component={
        <Link
          to={{
            pathname: getUrl("CompileDetails", {
              id: rejection.compile_id,
            }),
            search: location.search,
          }}
        >
          {words("diagnose.links.compileReport")}
        </Link>
      }
    ></DropdownItem>,
  ];
  if (rejection.model_version) {
    dropdownItems.push(
      <DropdownExternalLink
        key="modelVersionLink"
        url={urlManager.getModelVersionUrl(rejection.model_version.toString())}
        linkText={words("diagnose.links.modelVersionDetails")}
      />
    );
  }

  const error = rejection.error;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{words("diagnose.rejection.title")}</CardTitle>
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
      {error && <StyledCardTitle>{error.type}</StyledCardTitle>}
      <CardBody>
        {error && <pre>{error.message}</pre>}
        {rejection.trace && <Traceback trace={rejection.trace} />}
      </CardBody>
    </Card>
  );
};

const StyledCardTitle = styled(CardTitle)`
  ${greyText}
`;
