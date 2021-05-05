import { DropdownItem } from "@patternfly/react-core";
import { ExternalLinkAltIcon } from "@patternfly/react-icons";
import React from "react";
import { HrefCreator } from "@/UI/Components";

interface Props {
  id: string;
  hrefCreator: HrefCreator;
  linkText: string;
}

export const DropdownExternalLink: React.FC<Props> = ({
  id,
  hrefCreator,
  linkText,
}) => {
  const href = hrefCreator.create(id);
  return (
    <DropdownItem
      component="a"
      icon={<ExternalLinkAltIcon />}
      href={href}
      target="_blank"
      className="patternfly-default-link-color"
    >
      {linkText}
    </DropdownItem>
  );
};
