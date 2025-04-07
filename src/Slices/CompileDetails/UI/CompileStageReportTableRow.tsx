import React from 'react';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Icon,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { Td, Tr, Tbody } from '@patternfly/react-table';
import { CodeHighlighter } from '@/UI/Components';
import { words } from '@/UI/words';
import { CompileStageReportRow } from '@S/CompileDetails/Core/Domain';

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
  const failed =
    row.returncode !== null &&
    row.returncode !== undefined &&
    row.returncode !== 0;

  return (
    <Tbody isExpanded={false}>
      <Tr aria-label="Compile Run Reports Table Row" key={row.id}>
        <Td
          expand={{
            rowIndex: index,
            isExpanded,
            onToggle,
          }}
        />
        <Td dataLabel={words('compileDetails.stages.columns.name')}>
          {failed && (
            <Icon status="danger">
              <ExclamationCircleIcon />
            </Icon>
          )}{' '}
          {row.name}
        </Td>
        <Td dataLabel={words('compileDetails.stages.columns.command')}>
          {row.shortCommand}
        </Td>
        <Td
          dataLabel={words('compileDetails.stages.columns.delay')}
          modifier="fitContent"
        >
          {row.startDelay}
        </Td>
        <Td
          dataLabel={words('compileDetails.stages.columns.duration')}
          modifier="fitContent"
        >
          {row.duration}
        </Td>
      </Tr>
      <Tr isExpanded={isExpanded}>
        <Td colSpan={numberOfColumns}>
          <DescriptionList
            isHorizontal
            isFillColumns
            style={{
              paddingTop:
                'var(--pf-t--global--spacer--control--vertical--default',
            }}
          >
            <DescriptionListGroup>
              <DescriptionListTerm>
                {words('compileDetails.stages.columns.command')}
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
                {words('compileDetails.stages.columns.returnCode')}
              </DescriptionListTerm>
              <DescriptionListDescription>
                {row.returncode as React.ReactNode}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>
                {words('compileDetails.stages.columns.outstream')}
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
                {words('compileDetails.stages.columns.errstream')}
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
          </DescriptionList>
        </Td>
      </Tr>
    </Tbody>
  );
};
