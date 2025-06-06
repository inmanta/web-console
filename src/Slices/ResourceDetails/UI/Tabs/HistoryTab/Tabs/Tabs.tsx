import React from "react";
import { Card, CardBody } from "@patternfly/react-core";
import { ListIcon, ModuleIcon } from "@patternfly/react-icons";

import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";
import { JsonFormatter, XmlFormatter } from "@/Data";
import { AttributeClassifier, AttributeList, IconTabs, TabDescriptor } from "@/UI/Components";
import { words } from "@/UI/words";

export enum TabKey {
  Attributes = "Attributes",
  Requires = "Requires",
}

interface Props {
  attributes: Record<string, unknown>;
  requires: string[];
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
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
 *
 * @returns {React.FC<Props>} A React Component displaying the tabs of the history tab
 */
export const Tabs: React.FC<Props> = ({ attributes, requires, activeTab, setActiveTab }) => {
  return (
    <IconTabs
      activeTab={activeTab}
      onChange={setActiveTab}
      tabs={[attributesTab(attributes), requiresTab(requires)]}
    />
  );
};

/**
 * The attributes tab.
 *
 * This component is responsible of displaying the attributes of the resource.
 *
 * @Props {Props} - The props of the component
 *  @prop {Record<string, unknown>} attributes - The attributes of the resource
 *
 * @returns {TabDescriptor<TabKey>} A TabDescriptor
 */
const attributesTab = (attributes: Record<string, unknown>): TabDescriptor<TabKey> => ({
  id: TabKey.Attributes,
  title: words("resources.history.tabs.attributes"),
  icon: <ListIcon />,
  view: <AttributesTab attributes={attributes} />,
});

const requiresTab = (requires: string[]): TabDescriptor<TabKey> => ({
  id: TabKey.Requires,
  title: words("resources.history.tabs.requires"),
  icon: <ModuleIcon />,
  view: <RequiresTab requires={requires} />,
});

/**
 * The attributes tab.
 *
 * This component is responsible of displaying the attributes of the resource.
 *
 * @Props {Props} - The props of the component
 *  @prop {Record<string, unknown>} attributes - The attributes of the resource
 *
 * @returns {React.FC<{ attributes: Record<string, unknown> }>} A React Component displaying the attributes of the resource
 */
const AttributesTab: React.FC<{ attributes: Record<string, unknown> }> = ({ attributes }) => {
  const classifier = new AttributeClassifier(
    new JsonFormatter(),
    new XmlFormatter(),
    (key: string, value: string) => ({ kind: "Code", key, value })
  );
  const classifiedAttributes = classifier.classify(attributes);

  return (
    <Card isCompact>
      <CardBody>
        <AttributeList attributes={classifiedAttributes} />
      </CardBody>
    </Card>
  );
};

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
  <Table aria-label={words("resources.history.tabs.requires")}>
    <Thead>
      <Tr>
        <Th>{words("resources.history.tabs.requires")}</Th>
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
