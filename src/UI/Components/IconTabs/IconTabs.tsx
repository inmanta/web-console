import React from "react";
import { Tabs, Tab, TabTitleText, TabTitleIcon } from "@patternfly/react-core";

export interface TabDescriptor<K extends string> {
  id: K;
  title: string;
  icon: React.ReactNode;
  view: React.ReactNode;
  isDisabled?: boolean;
  ref?: React.MutableRefObject<HTMLElement | undefined>;
}

/**
 * Props for the IconTabs component.
 *
 * When tabContentId is provided, the tabs render as a bar only: each tab is linked
 * to an external <TabContent> through the returned id, so the caller can render the
 * active tab's content in a separate region (e.g. a scrollable PageSection). When it
 * is omitted, each tab's view is rendered inline as tab content.
 */
interface Props<K extends string> {
  tabs: TabDescriptor<K>[];
  activeTab: K;
  onChange: (tabKey: K) => void;
  tabContentId?: (tabKey: K) => string;
  isSticky?: boolean;
}

/**
 * Keeps a tab bar in view at the top of the scrolling PageContainer content section.
 * The negative offset cancels the section's top padding, so content can't scroll by above the bar.
 */
export const stickyTabsStyle: React.CSSProperties = {
  position: "sticky",
  top: "calc(-1 * var(--pf-v6-c-page__main-section--PaddingBlockStart))",
  zIndex: "var(--pf-t--global--z-index--sm)",
  flexShrink: 0,
  backgroundColor: "var(--pf-t--global--background--color--primary--default)",
};

/**
 * A tabs component with icons in the title
 */
export const IconTabs = <Key extends string>({
  activeTab,
  onChange,
  tabs,
  tabContentId,
  isSticky,
}: Props<Key>): ReturnType<React.FC<Props<Key>>> => {
  const setActiveTabWithEventKey = (_event, eventKey: number | string) => onChange(eventKey as Key);

  return (
    <Tabs
      activeKey={activeTab}
      onSelect={setActiveTabWithEventKey}
      mountOnEnter
      unmountOnExit
      style={isSticky ? stickyTabsStyle : undefined}
    >
      {tabs.map((tab) => (
        <Tab
          key={tab.id}
          eventKey={tab.id}
          ref={tab.ref}
          isAriaDisabled={tab.isDisabled}
          tabContentId={tabContentId?.(tab.id)}
          title={
            <>
              <TabTitleIcon>{tab.icon}</TabTitleIcon>
              <TabTitleText>{tab.title}</TabTitleText>
            </>
          }
        >
          {tabContentId ? undefined : tab.view}
        </Tab>
      ))}
    </Tabs>
  );
};
