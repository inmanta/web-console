import React from "react";
import { Avatar } from "@patternfly/react-core";
import fallBackImage from "@images/inmanta-wings.svg";

/**
 * The icon of an environment, or the Inmanta logo when the environment has none.
 */
export const EnvironmentIcon: React.FC<{ icon?: string }> = ({ icon }) => (
  <Avatar
    src={icon ?? fallBackImage}
    alt="Environment icon"
    style={{ height: "20px", width: "20px", display: "block" }}
  />
);
