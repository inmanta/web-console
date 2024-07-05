import React from "react";
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from "@patternfly/react-core";
import { Tbody, Tr, Td } from "@patternfly/react-table";
import styled from "styled-components";
import { CodeHighlighter, Toggle } from "@/UI/Components";
import { words } from "@/UI/words";
import { DiscoveredResource } from "../Core/Query";
import { ManagedResourceLink } from "./Components";

interface Props {
  row: Pick<
    DiscoveredResource,
    "discovered_resource_id" | "values" | "managed_resource_uri"
  >;
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
        <Td style={{ width: "15px" }}>
          <Toggle
            expanded={isExpanded}
            onToggle={onToggle}
            aria-label={`Toggle-${row.discovered_resource_id}`}
          />
        </Td>
        <Td
          dataLabel={words("discovered.column.resource_id")}
          style={{ width: "50vw" }}
          data-testid={words("discovered.column.resource_id")}
        >
          {row.discovered_resource_id}
        </Td>
        <Td
          dataLabel={words("discovered.column.managed_resource")}
          data-testid={words("discovered.column.managed_resource")}
        >
          <ManagedResourceLink resourceUri={row.managed_resource_uri} />
        </Td>
      </Tr>
      {isExpanded && (
        <Tr aria-label="Expanded-Discovered-Row" isExpanded={isExpanded}>
          <Td colSpan={numberOfColumns}>
            <PaddedDescriptionList isHorizontal>
              <DescriptionListGroup>
                <DescriptionListTerm>
                  {words("discovered_resources.values")}
                </DescriptionListTerm>
                <DescriptionListDescription>
                  <CodeHighlighter
                    keyId="Json"
                    code={JSON.stringify(row.values, null, 2)}
                    language="json"
                  />
                </DescriptionListDescription>
              </DescriptionListGroup>
            </PaddedDescriptionList>
          </Td>
        </Tr>
      )}
    </Tbody>
  );
};

const PaddedDescriptionList = styled(DescriptionList)`
  padding-bottom: 1em;
  padding-top: 1em;
`;
