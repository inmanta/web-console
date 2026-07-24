import React from "react";
import {
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Title,
} from "@patternfly/react-core";

interface Props {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  minSize?: string;
}

export const FilterDrawerPanelContent: React.FC<Props> = ({
  title,
  onClose,
  children,
  minSize = "300px",
}) => (
  <DrawerPanelContent isResizable minSize={minSize}>
    <DrawerHead>
      <Title headingLevel="h2" size="xl">
        {title}
      </Title>
      <DrawerActions>
        <DrawerCloseButton onClick={onClose} />
      </DrawerActions>
    </DrawerHead>
    <DrawerPanelBody>{children}</DrawerPanelBody>
  </DrawerPanelContent>
);
