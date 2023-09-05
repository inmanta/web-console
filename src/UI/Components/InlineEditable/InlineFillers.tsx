import { FlexItem } from "@patternfly/react-core";
import styled from "styled-components";

export const InlineEditButtonFiller = styled.div`
  height: 23px;
  width: 60px;
`;

export const InlineLabelItem = styled(FlexItem)`
  && {
    line-height: var(--pf-v5-global--LineHeight--md);
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
