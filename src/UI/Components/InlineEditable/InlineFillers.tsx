import { FlexItem } from '@patternfly/react-core';
import styled from 'styled-components';

// Will be removed when collapsible sections in the service inventory are removed
export const InlineEditButtonFiller = styled.div`
  height: 23px;
  width: 60px;
`;

export const InlineLabelItem = styled(FlexItem)`
  && {
    margin-bottom: 7px;
  }
`;

export const InlineAreaValue = styled.div`
  padding-bottom: 6px;
  padding-top: 6px;
  padding-left: 9px;
  height: 75px;
`;

export const InlineValue = styled.div`
  padding-bottom: 6px;
  padding-top: 6px;
  padding-left: 9px;
  height: 36px;
`;
