import styled, { keyframes } from "styled-components";

//Indication colors based on <Label color="blue" /> component
const pendingAnimation = keyframes`
 0% { opacity: .2}
 50% { opacity: 1}
 100% { opacity: .2}
`;

export const DotIndication = styled.span`
  width: 10px;
  height: 10px;
  margin-left: 10px;
  position: relative;
  &::before {
    position: absolute;
    top: 5px;
    content: "";
    background-color: var(--pf-global--primary-color--100);
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: 1px solid #bee1f4;
    animation: ${pendingAnimation} 2s infinite;
  }
`;
