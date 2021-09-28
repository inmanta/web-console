import React from "react";
import styled from "styled-components";
import { CompileStageReportRow } from "@/Core";
import { CodeHighlighter, TextWithCopy } from "@/UI/Components";
import { words } from "@/UI/words";
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from "@patternfly/react-core";
import { Td, Tr, Tbody } from "@patternfly/react-table";

interface Props {
  row: CompileStageReportRow;
  isExpanded: boolean;
  onToggle: () => void;
  numberOfColumns: number;
  index: number;
}

export const CompileStageReportTableRow: React.FC<Props> = ({
  row,
  isExpanded,
  onToggle,
  numberOfColumns,
  index,
}) => {
  return (
    <StyledBody
      isExpanded={false}
      $failed={
        row.returncode !== null &&
        row.returncode !== undefined &&
        row.returncode !== 0
      }
    >
      <Tr aria-label="Compile Run Reports Table Row" key={row.id}>
        <Td
          expand={{
            rowIndex: index,
            isExpanded,
            onToggle,
          }}
        />
        <Td dataLabel={words("compileDetails.stages.columns.name")}>
          {row.name}
        </Td>
        <Td dataLabel={words("compileDetails.stages.columns.command")}>
          {row.shortCommand}
        </Td>
        <Td dataLabel={words("compileDetails.stages.columns.delay")}>
          {row.startDelay}
        </Td>
        <Td dataLabel={words("compileDetails.stages.columns.duration")}>
          {row.duration}
        </Td>
      </Tr>
      <Tr isExpanded={isExpanded}>
        <Td colSpan={numberOfColumns}>
          <DescriptionList isHorizontal>
            <DescriptionListGroup>
              <DescriptionListTerm>
                {words("compileDetails.stages.columns.command")}
              </DescriptionListTerm>
              <DescriptionListDescription>
                <code>
                  <TextWithCopy
                    value={row.command}
                    tooltipContent={words("compileDetails.stages.copy")}
                  />
                </code>
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>
                {words("compileDetails.stages.columns.returnCode")}
              </DescriptionListTerm>
              <DescriptionListDescription>
                {row.returncode}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>
                {words("compileDetails.stages.columns.outstream")}
              </DescriptionListTerm>
              <DescriptionListDescription>
                <CodeHighlighter code={row.outstream} language="python" />
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>
                {words("compileDetails.stages.columns.errstream")}
              </DescriptionListTerm>
              <DescriptionListDescription>
                <CodeHighlighter code={row.errstream} language="python" />
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </Td>
      </Tr>
    </StyledBody>
  );
};

const StyledBody = styled(Tbody)<{
  $failed?: boolean;
}>`
  ${({ $failed }) =>
    $failed ? "background-color: var(--pf-global--palette--red-50)" : ""};
`;
