import React from "react";
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from "@patternfly/react-core";
import { Td, Tr, Tbody } from "@patternfly/react-table";
import styled from "styled-components";
import { CodeHighlighter } from "@/UI/Components";
import { words } from "@/UI/words";
import { CompileStageReportRow } from "@S/CompileDetails/Core/Domain";

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
          <PaddedDescriptionList isHorizontal>
            <DescriptionListGroup>
              <DescriptionListTerm>
                {words("compileDetails.stages.columns.command")}
              </DescriptionListTerm>
              <DescriptionListDescription>
                <CodeHighlighter
                  keyId="command"
                  code={row.command}
                  language="bash"
                />
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>
                {words("compileDetails.stages.columns.returnCode")}
              </DescriptionListTerm>
              <DescriptionListDescription>
                {row.returncode as React.ReactNode}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>
                {words("compileDetails.stages.columns.outstream")}
              </DescriptionListTerm>
              <DescriptionListDescription>
                <CodeHighlighter
                  keyId="outstream"
                  scrollBottom
                  code={row.outstream}
                  language="python"
                />
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>
                {words("compileDetails.stages.columns.errstream")}
              </DescriptionListTerm>
              <DescriptionListDescription>
                <CodeHighlighter
                  keyId="error-stream"
                  scrollBottom
                  code={row.errstream}
                  language="python"
                />
              </DescriptionListDescription>
            </DescriptionListGroup>
          </PaddedDescriptionList>
        </Td>
      </Tr>
    </StyledBody>
  );
};

const StyledBody = styled(Tbody)<{
  $failed?: boolean;
}>`
  ${({ $failed }) =>
    $failed ? "var(--pf-t--temp--dev--tbd)"/* CODEMODS: original v5 color was --pf-v5-global--palette--red-50 */ : ""};
`;

const PaddedDescriptionList = styled(DescriptionList)`
  padding-bottom: 1em;
  padding-top: 1em;
`;
