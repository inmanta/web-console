import React from "react";
import { Card, CardBody, CardTitle } from "@patternfly/react-core";
import { words } from "@/UI/words";

interface Props {
  title: string;
}

/**
 * Temporary stand-in for a Dashboard V2 block whose data wiring hasn't been built yet.
 * Replaced section-by-section in Phases 5-8 with the real, data-wired component.
 */
export const PlaceholderSection: React.FC<Props> = ({ title }) => (
  <Card>
    <CardTitle>{title}</CardTitle>
    <CardBody>{words("dashboardV2.placeholder.comingSoon")}</CardBody>
  </Card>
);
