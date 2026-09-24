import React from "react";
import { ListIcon, ModuleIcon } from "@patternfly/react-icons";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";
import { AttributeClassifier } from "@/Data";
import { IconTabs, ResourceAttributes, TabDescriptor } from "@/UI/Components";
import { words } from "@/UI/words";

const classifier = new AttributeClassifier();

export enum TabKey {
  Attributes = "Attributes",
  Requires = "Requires",
}

interface Props {
  attributes: Record<string, unknown>;
  requires: string[];
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  isReferenceExpanded: (key: string) => boolean;
  onReferenceToggle: (key: string) => () => void;
}

/**
 * The Tabs component.
 *
 * This component is responsible of displaying the tabs of the history tab.
 *
 * @Props {Props} - The props of the component
 *  @prop {Record<string, unknown>} attributes - The attributes of the resource
 *  @prop {string[]} requires - The requires of the resource
 *  @prop {TabKey} activeTab - The active tab
 *  @prop {(tab: TabKey) => void} setActiveTab - The function to set the active tab
 *  @prop {(key: string) => boolean} isReferenceExpanded - Whether the reference node at a path is expanded
 *  @prop {(key: string) => () => void} onReferenceToggle - Returns the toggle handler for a reference path
 *
 * @returns {React.FC<Props>} A React Component displaying the tabs of the history tab
 */
export const Tabs: React.FC<Props> = ({
  attributes,
  requires,
  activeTab,
  setActiveTab,
  isReferenceExpanded,
  onReferenceToggle,
}) => {
  return (
    <IconTabs
      activeTab={activeTab}
      onChange={setActiveTab}
      tabs={[
        attributesTab(
          <ResourceAttributes
            attributes={attributes}
            classifier={classifier}
            isExpanded={isReferenceExpanded}
            onToggle={onReferenceToggle}
          />
        ),
        requiresTab(requires),
      ]}
    />
  );
};

/**
 * The descriptor of the attributes tab, wrapping the given attribute view.
 *
 * @example attributesTab(<ResourceAttributes ... />) => { id: TabKey.Attributes, ... }
 */
const attributesTab = (view: React.ReactNode): TabDescriptor<TabKey> => ({
  id: TabKey.Attributes,
  title: words("resources.history.tabs.attributes"),
  icon: <ListIcon />,
  view,
});

const requiresTab = (requires: string[]): TabDescriptor<TabKey> => ({
  id: TabKey.Requires,
  title: words("requires"),
  icon: <ModuleIcon />,
  view: <RequiresTab requires={requires} />,
});

/**
 * The requires tab.
 *
 * This component is responsible of displaying the requires of the resource.
 *
 * @Props {Props} - The props of the component
 *  @prop {string[]} requires - The requires of the resource
 *
 * @returns {React.FC<{ requires: string[] }>} A React Component displaying the requires of the resource
 */
const RequiresTab: React.FC<{ requires: string[] }> = ({ requires }) => (
  <Table aria-label={words("requires")}>
    <Thead>
      <Tr>
        <Th>{words("requires")}</Th>
      </Tr>
    </Thead>
    <Tbody>
      {requires.length ? (
        requires.map((row, index) => (
          <Tr key={row}>
            <Td key={`${row}${index}`}>{row}</Td>
          </Tr>
        ))
      ) : (
        <Tr key="empty-row">
          <Td key="empty-row-data">{words("resources.requires.empty.message")}</Td>
        </Tr>
      )}
    </Tbody>
  </Table>
);
