import { Rejection } from "@/Core";
import {
  CompileReportHrefCreator,
  ModelVersionHrefCreator,
} from "@/UI/Components";
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
import { Traceback } from "./Traceback";

interface Props {
  rejection: Rejection;
  environment: string;
}

export const RejectionCard: React.FC<Props> = ({
  rejection: rejection,
  environment,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownItems: React.ReactNode[] = [
    <DropdownExternalLink
      key="compileReportLink"
      hrefCreator={new CompileReportHrefCreator(environment)}
      id={rejection.compile_id}
      linkText={words("diagnose.links.compileReport")}
    />,
  ];
  if (rejection.model_version) {
    dropdownItems.push(
      <DropdownExternalLink
        key="modelVersionLink"
        hrefCreator={new ModelVersionHrefCreator(environment)}
        id={rejection.model_version.toString()}
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
      <CardTitle className="patternfly-text-gray">{error.type}</CardTitle>
      <CardBody>
        <pre>{error.message}</pre>
        {rejection.trace && <Traceback trace={rejection.trace} />}
      </CardBody>
    </Card>
  );
};
