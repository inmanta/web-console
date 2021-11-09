import React from "react";
import { TextContent, Text, TextVariants } from "@patternfly/react-core";

export const Description: React.FC = ({ children }) => (
  <TextContent>
    <Text component={TextVariants.small}>{children}</Text>
  </TextContent>
);
