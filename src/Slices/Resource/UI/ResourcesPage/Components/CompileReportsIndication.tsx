import styled, { keyframes } from "styled-components";

//Indication colors based on <Label color="blue" /> component
const pendingAnimation = keyframes`
 0% { opacity: .2}
 50% { opacity: 1}
 100% { opacity: .2}
`;

export const CompileReportsIndication = styled.span`
  width: 10px;
  height: 10px;
  margin-left: 10px;
  position: relative;
  &::before {
    position: absolute;
    top: 1px;
    content: "";
    background-color: var(--pf-t--global--color--nonstatus--blue--default);
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: 1px solid
      var(--pf-t--global--border--color--nonstatus--blue--default);
    animation: ${pendingAnimation} 2s infinite;
  }
`;
