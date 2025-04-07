import React from 'react';
import { Tbody, Td, Tr, ExpandableRowContent } from '@patternfly/react-table';
import { LogLevelString } from '@/Core';
import { CodeText } from '@/UI/Components';
import { MomentDatePresenter } from '@/UI/Utils';
import { ResourceLog } from '@S/ResourceDetails/Core/ResourceLog';
import { Details } from './Details';
import { RowOptions, ToggleActionType } from './RowOptions';

interface Props {
  log: ResourceLog;
  isExpanded: boolean;
  onToggle: () => void;
  numberOfColumns: number;
  index: number;
  toggleActionType: ToggleActionType;
}

const datePresenter = new MomentDatePresenter();

export const Row: React.FC<Props> = ({
  log,
  isExpanded,
  index,
  onToggle,
  numberOfColumns,
  toggleActionType,
}) => {
  return (
    <Tbody isExpanded={false} aria-label="ResourceLogRow">
      <Tr className={getClassForLevel(log.level)}>
        <Td
          expand={{
            rowIndex: index,
            isExpanded,
            onToggle,
          }}
        />
        <Td modifier="fitContent">{datePresenter.getFull(log.timestamp)}</Td>
        <Td modifier="fitContent">{log.action}</Td>
        <Td modifier="fitContent">{log.level}</Td>
        <Td modifier="truncate">
          <CodeText singleLine>{log.msg}</CodeText>
        </Td>
        <Td isActionCell>
          <RowOptions toggleActionType={toggleActionType} action={log.action} />
        </Td>
      </Tr>
      {isExpanded && (
        <Tr isExpanded={isExpanded} className={getClassForLevel(log.level)}>
          <Td colSpan={numberOfColumns}>
            <ExpandableRowContent>
              <Details log={log} />
            </ExpandableRowContent>
          </Td>
        </Tr>
      )}
    </Tbody>
  );
};

const getClassForLevel = (level: string): string => {
  switch (level) {
    case LogLevelString.WARNING:
      return 'warning';
    case LogLevelString.ERROR:
    case LogLevelString.CRITICAL:
      return 'danger';
    default:
      return '';
  }
};
