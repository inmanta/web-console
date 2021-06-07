import React from "react";
import styled from "styled-components";
import { DropdownItem } from "@patternfly/react-core";
import { ExternalLinkAltIcon } from "@patternfly/react-icons";

interface Props {
  url: string;
  linkText: string;
}

export const DropdownExternalLink: React.FC<Props> = ({ url, linkText }) => (
  <StyledDropdownItem
    component="a"
    icon={<ExternalLinkAltIcon />}
    href={url}
    target="_blank"
  >
    {linkText}
  </StyledDropdownItem>
);

const StyledDropdownItem = styled(DropdownItem)`
  color: var(--pf-global--link--Color);
`;
