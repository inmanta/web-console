import React from 'react';
import { Flex, FlexItem, SelectOptionProps } from '@patternfly/react-core';
import { EnvironmentSettings } from '@/Core';
import { SingleTextSelect } from '@/UI/Components';
import { Warning } from './Warning';

interface Props {
  info: EnvironmentSettings.EnumInputInfo;
}

export const EnumInput: React.FC<Props> = ({ info }) => {
  const setSelected = (value) => (value !== null ? info.set(value) : undefined);
  const options: SelectOptionProps[] = info.allowed_values.map((option) => {
    return { value: option, children: option };
  });

  return (
    <Flex direction={{ default: 'row' }}>
      <FlexItem grow={{ default: 'grow' }}>
        <SingleTextSelect
          selected={info.value}
          setSelected={setSelected}
          options={options}
          toggleAriaLabel={`EnumInput-${info.name}`}
        />
      </FlexItem>

      <FlexItem style={{ minWidth: '20px' }}>
        {info.isUpdateable(info) && <Warning />}
      </FlexItem>
    </Flex>
  );
};
