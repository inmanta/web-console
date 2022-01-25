import React from "react";
import { TextContent, Text, TextVariants } from "@patternfly/react-core";

interface Props {
  className?: string;
}

export const Description: React.FC<Props> = ({ children, className }) => (
  <TextContent className={className}>
    <Text component={TextVariants.small}>{children}</Text>
  </TextContent>
);
