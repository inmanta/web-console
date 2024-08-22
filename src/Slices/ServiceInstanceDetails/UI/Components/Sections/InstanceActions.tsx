import React from "react";
import styled from "styled-components";

// TODO: implement InstanceActions.
// https://github.com/inmanta/web-console/issues/5859
export const InstanceActions: React.FC = () => {
  return <RightAlignedButtons></RightAlignedButtons>;
};

const RightAlignedButtons = styled.span`
  float: right;
  margin-right: var(--pf-v5-global--spacer--lg);

  // To be removed, this is just visual indication.
  background: gray;
  width: 400px;
  height: 30px;
`;
