import React from "react";
import {
  Button,
  Divider,
  DrawerActions,
  DrawerHead,
  Flex,
  FlexItem,
  Skeleton,
} from "@patternfly/react-core";
import { AngleLeftIcon, AngleRightIcon } from "@patternfly/react-icons";
import { Table, Tbody, Td, Tr } from "@patternfly/react-table";
import { words } from "@inmanta/web-console-core";

/**
 * The number of placeholder rows under the header of the loading diff pane.
 */
const ATTRIBUTE_ROW_COUNT = 4;

/**
 * The diff pane while the diff loads: the same header as the pane, with loading placeholders for
 * the status, the name and the full id and its Previous and Next shown but disabled, above
 * placeholder rows for the diff, whose layout depends on the resource.
 *
 * @returns {React.FC} The loading diff pane
 */
export const DiffPaneSkeleton: React.FC = () => (
  <>
    <DrawerHead>
      <Flex direction={{ default: "column" }} gap={{ default: "gapSm" }}>
        <Flex
          gap={{ default: "gapMd" }}
          alignItems={{ default: "alignItemsCenter" }}
          flexWrap={{ default: "nowrap" }}
        >
          <FlexItem flex={{ default: "flexNone" }}>
            <Skeleton
              fontSize="sm"
              width="5rem"
              screenreaderText={words("desiredState.compare.loading.diff")}
            />
          </FlexItem>
          <FlexItem flex={{ default: "flex_1" }}>
            <Skeleton fontSize="lg" width="50%" />
          </FlexItem>
        </Flex>
        {/* As high as the line with the full id and the link to the resource. */}
        <Skeleton height="20px" width="70%" />
      </Flex>
      <DrawerActions>
        <Flex gap={{ default: "gapMd" }} flexWrap={{ default: "nowrap" }}>
          <Button variant="link" isInline icon={<AngleLeftIcon />} isAriaDisabled>
            {words("previous")}
          </Button>
          <Button
            variant="link"
            isInline
            icon={<AngleRightIcon />}
            iconPosition="end"
            isAriaDisabled
          >
            {words("next")}
          </Button>
        </Flex>
      </DrawerActions>
    </DrawerHead>
    <Divider />
    {/* Hidden from screen readers, which hear the loading text of the header instead. */}
    <Table variant="compact" gridBreakPoint="" aria-hidden>
      <Tbody>
        {Array.from({ length: ATTRIBUTE_ROW_COUNT }, (_value, index) => (
          <Tr key={index}>
            <Td width={20}>
              <Skeleton fontSize="sm" width="70%" />
            </Td>
            <Td width={40}>
              <Skeleton fontSize="sm" width="80%" />
            </Td>
            <Td width={40}>
              <Skeleton fontSize="sm" width="80%" />
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  </>
);
