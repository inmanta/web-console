import React from "react";
import { CodeEditor, Language } from "@patternfly/react-code-editor";
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from "@patternfly/react-core";
import { Tbody, Tr, Td } from "@patternfly/react-table";
import styled from "styled-components";
import { DiscoveredResource } from "@/Data/Managers/V2/DiscoveredResources";
import { Toggle } from "@/UI/Components";
import { words } from "@/UI/words";
import { DiscoveredResourceLink } from "./Components";
import { CodeEditorCopyControl } from "@/UI/Components/CodeEditorControls";

interface Props {
  row: DiscoveredResource;
  isExpanded: boolean;
  onToggle: () => void;
  numberOfColumns: number;
}

export const DiscoveredResourceRow: React.FC<Props> = ({
  row,
  isExpanded,
  onToggle,
  numberOfColumns,
}) => {
  return (
    <Tbody>
      <Tr aria-label="DiscoveredResourceRow">
        <Td>
          <Toggle
            expanded={isExpanded}
            onToggle={onToggle}
            aria-label={`Toggle-${row.discovered_resource_id}`}
          />
        </Td>
        <Td
          dataLabel={words("discovered.column.resource_id")}
          data-testid={words("discovered.column.resource_id")}
          modifier="truncate"
        >
          {row.discovered_resource_id}
        </Td>
        <Td
          dataLabel={words("discovered.column.managed_resource")}
          data-testid={words("discovered.column.managed_resource")}
          width={15}
        >
          <DiscoveredResourceLink resourceUri={row.managed_resource_uri} type="managed" />
        </Td>
        <Td
          dataLabel={words("discovered.column.discovery_resource")}
          data-testid={words("discovered.column.discovery_resource")}
          width={20}
        >
          <DiscoveredResourceLink resourceUri={row.discovery_resource_uri} type="discovery" />
        </Td>
      </Tr>
      {isExpanded && (
        <>
          <Tr aria-label="Expanded-Discovered-Row" isExpanded={isExpanded}>
            <Td colSpan={numberOfColumns}>
              <PaddedDescriptionList isHorizontal>
                <DescriptionListGroup>
                  <DescriptionListTerm>{words("discovered_resources.values")}</DescriptionListTerm>
                  <DescriptionListDescription>
                    <CodeEditor
                      code={JSON.stringify(row.values, null, 2)}
                      language={Language.json}
                      isDownloadEnabled
                      customControls={
                        <CodeEditorCopyControl code={JSON.stringify(row.values, null, 2)} />
                      }
                      isReadOnly
                      height="400px"
                    />
                  </DescriptionListDescription>
                </DescriptionListGroup>
              </PaddedDescriptionList>
            </Td>
          </Tr>
        </>
      )}
    </Tbody>
  );
};

const PaddedDescriptionList = styled(DescriptionList)`
  padding-bottom: 1em;
  padding-top: 1em;
`;
