import React from 'react';
import { Flex, FlexItem, Switch } from '@patternfly/react-core';
import { EnvironmentSettings } from '@/Core';
import { Warning } from './Warning';

interface Props {
  info: EnvironmentSettings.BooleanInputInfo;
}

export const BooleanInput: React.FC<Props> = ({ info }) => (
  <Flex direction={{ default: 'row' }}>
    <FlexItem>
      <Switch
        isChecked={info.value}
        onChange={(_event, value) => info.set(value)}
        aria-label={`Toggle-${info.name}`}
      />
    </FlexItem>

    <FlexItem style={{ minWidth: '20px' }}>
      {info.isUpdateable(info) && <Warning />}
    </FlexItem>
  </Flex>
);
