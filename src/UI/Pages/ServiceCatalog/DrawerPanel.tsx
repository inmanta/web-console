import { InstanceSummary } from "@/Core";
import { words } from "@/UI";
import { EmptyView } from "@/UI/Components";
import {
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Title,
} from "@patternfly/react-core";
import React from "react";
import { InstanceLabelSummary } from "./InstanceLabelSummary";

interface Props {
  onCloseDrawer(): void;
  serviceName: string;
  summary?: InstanceSummary;
}

export const DrawerPanel: React.FC<Props> = ({
  serviceName,
  summary,
  onCloseDrawer,
}) => {
  return (
    <DrawerPanelContent aria-label="InstanceSummaryPanel">
      <DrawerHead>
        <Title headingLevel="h2" size="xl">
          {words("catalog.drawer.title")(serviceName)}
        </Title>
        <DrawerActions>
          <DrawerCloseButton
            aria-label="CloseSummaryButton"
            onClick={onCloseDrawer}
          />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody>
        {summary ? (
          <InstanceLabelSummary summary={summary} />
        ) : (
          <EmptyView message={words("catalog.drawer.summary.empty")} />
        )}
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};
