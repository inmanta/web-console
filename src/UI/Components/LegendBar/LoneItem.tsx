import React from "react";
import {
  t_temp_dev_tbd as global_Color_100 /* CODEMODS: you should update this color token */,
  t_temp_dev_tbd as global_palette_blue_50 /* CODEMODS: you should update this color token */,
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
  >
    {label}
  </Container>
);
