import React from "react";
import styled from "styled-components";

export const ExpandAll: React.FC = () => {
  return (
    <SvgWrapper
      viewBox="0 0 512 512"
      preserveAspectRatio="none"
      className="ExpandAll"
    >
      <path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zM200 344V280H136c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H248v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z" />
    </SvgWrapper>
  );
};

export const CollapseAll: React.FC = () => {
  return (
    <SvgWrapper
      viewBox="0 0 512 512"
      preserveAspectRatio="none"
      className="CollapseAll"
    >
      <path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zm88 200H296c13.3 0 24 10.7 24 24s-10.7 24-24 24H152c-13.3 0-24-10.7-24-24s10.7-24 24-24z" />
    </SvgWrapper>
  );
};

const SvgWrapper = styled.svg`
  margin-top: 2px;
  width: 18px;
  height: 18px;
  fill: #6a6e73;
  &:hover {
    fill: #000;
  }
`;
