import React from "react";
import { DropdownItem } from "@patternfly/react-core";
import { ExternalLinkAltIcon } from "@patternfly/react-icons";

interface Props {
  url: string;
  linkText: string;
}

export const DropdownExternalLink: React.FC<Props> = ({ url, linkText }) => (
  <DropdownItem
    component="a"
    icon={<ExternalLinkAltIcon />}
    href={url}
    target="_blank"
    className="patternfly-default-link-color"
  >
    {linkText}
  </DropdownItem>
);
