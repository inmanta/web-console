import React from 'react';
import { Content, Flex, FlexItem, Icon } from '@patternfly/react-core';
import { ArrowsAltHIcon } from '@patternfly/react-icons';
import { Diff } from '@/Core';

export const Versus: React.FC<Diff.Identifiers> = ({ from, to }) => (
  <Flex
    direction={{ default: 'row' }}
    alignItems={{ default: 'alignItemsBaseline' }}
    fullWidth={{ default: 'fullWidth' }}
    justifyContent={{ default: 'justifyContentCenter' }}
  >
    <FlexItem>
      <Content component="h2">{from}</Content>
    </FlexItem>
    <FlexItem>
      <Icon size="md">
        <ArrowsAltHIcon />
      </Icon>
    </FlexItem>
    <FlexItem>
      <Content component="h2">{to}</Content>
    </FlexItem>
  </Flex>
);
