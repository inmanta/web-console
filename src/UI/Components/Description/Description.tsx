import { TextContent, Text, TextVariants } from "@patternfly/react-core";
import React from "react";

export const Description: React.FC = ({ children }) => (
  <TextContent>
    <Text component={TextVariants.small}>{children}</Text>
  </TextContent>
);
