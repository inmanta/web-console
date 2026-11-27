import React from "react";
import { Flex, Skeleton } from "@patternfly/react-core";
import { Table, Tbody, Td, Th, Tr } from "@patternfly/react-table";
import { words } from "@inmanta/web-console-core";

/**
 * The widths of the resource names in the loading rows, varied so the rows read like a list.
 */
const ROW_NAME_WIDTHS = ["70%", "55%", "80%", "60%", "75%", "50%", "65%", "72%", "58%", "68%"];

/**
 * The resource list while the diff loads: the same compact table as the list, with a status
 * group header and rows of loading placeholders for the status letter, the name and the type and
 * agent line.
 *
 * @returns {React.FC} The loading resource list
 */
export const ResourceListSkeleton: React.FC = () => (
  <Table variant="compact" aria-label={words("resources")} aria-busy>
    <Tbody>
      <Tr isStriped>
        <Th colSpan={2} scope="rowgroup" isSubheader>
          <Skeleton
            fontSize="sm"
            width="6rem"
            screenreaderText={words("desiredState.compare.loading.resources")}
          />
        </Th>
      </Tr>
      {ROW_NAME_WIDTHS.map((nameWidth, index) => (
        <Tr key={index}>
          <Td modifier="fitContent">
            <Skeleton fontSize="sm" width="1.5rem" />
          </Td>
          <Td>
            {/* As high as the name and the smaller type and agent line of a listed resource. */}
            <Flex direction={{ default: "column" }} gap={{ default: "gapSm" }}>
              <Skeleton height="17px" width={nameWidth} />
              <Skeleton height="14px" width="40%" />
            </Flex>
          </Td>
        </Tr>
      ))}
    </Tbody>
  </Table>
);
