import React from "react";
import {
  t_global_background_color_100,
  t_global_text_color_brand_default,
} from "@patternfly/react-tokens";
import { Container } from "./Item";

export interface Props {
  label: string;
}

export const LoneItem: React.FC<Props> = ({ label }) => (
  <Container
    value={1}
    backgroundColor={t_global_background_color_100.var}
    color={t_global_text_color_brand_default.var}
  >
    {label}
  </Container>
);
