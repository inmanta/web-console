import React from 'react';
import { Flex, FlexItem, TextInput } from '@patternfly/react-core';
import { EnvironmentSettings } from '@/Core';
import { Warning } from './Warning';

interface Props {
  info: EnvironmentSettings.StrInputInfo;
}

export const StringInput: React.FC<Props> = ({ info }) => {
  return (
    <Flex direction={{ default: 'row' }}>
      <FlexItem grow={{ default: 'grow' }}>
        <TextInput
          value={info.value}
          onChange={(_event, value) => info.set(value)}
          aria-label="string input"
          type="text"
        />
      </FlexItem>

      <FlexItem style={{ minWidth: '20px' }}>
        {info.isUpdateable(info) && <Warning />}
      </FlexItem>
    </Flex>
  );
};
