import React, { useState, useContext } from "react";
import { Rejection } from "@/Core";
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
import { DependencyContext } from "@/UI/Dependency";
import { DropdownExternalLink } from "./ExternalLink";
import { Traceback } from "./Traceback";

interface Props {
  rejection: Rejection;
}

export const RejectionCard: React.FC<Props> = ({ rejection: rejection }) => {
  const { urlManager } = useContext(DependencyContext);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownItems: React.ReactNode[] = [
    <DropdownExternalLink
      key="compileReportLink"
      url={urlManager.getCompileReportUrl()}
      linkText={words("diagnose.links.compileReport")}
    />,
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
      {error && (
        <CardTitle className="patternfly-text-gray">{error.type}</CardTitle>
      )}
      <CardBody>
        {error && <pre>{error.message}</pre>}
        {rejection.trace && <Traceback trace={rejection.trace} />}
      </CardBody>
    </Card>
  );
};
