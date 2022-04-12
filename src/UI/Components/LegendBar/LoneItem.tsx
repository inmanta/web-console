import React from "react";
import {
  global_Color_100,
  global_palette_blue_50,
} from "@patternfly/react-tokens";
import { Container } from "./Item";

export interface Props {
  label: string;
}

export const LoneItem: React.FC<Props> = ({ label }) => (
  <Container
    value={1}
    backgroundColor={global_palette_blue_50.var}
    color={global_Color_100.var}
    aria-label={`LegendItem-lone`}
  >
    {label}
  </Container>
);
