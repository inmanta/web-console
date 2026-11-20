import { Th } from "@patternfly/react-table";
import styled from "styled-components";

/**
 * The name of an attribute, at the start of its row, in bold like the design of the diff.
 *
 * @note This sets PatternFly's internal `--pf-v6-c-table--cell--FontWeight`, so check it on a
 * PatternFly major upgrade.
 */
export const AttributeName = styled(Th)`
  --pf-v6-c-table--cell--FontWeight: var(--pf-t--global--font--weight--body--bold);
`;
