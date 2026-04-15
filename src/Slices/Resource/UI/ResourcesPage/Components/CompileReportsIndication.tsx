import styled, { keyframes } from "styled-components";

//Indication colors based on <Label color="blue" /> component
const pendingAnimation = keyframes`
 0% { opacity: .2}
 50% { opacity: 1}
 100% { opacity: .2}
`;

export const CompileReportsIndication = styled.span<{
  $size?: number;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ $size = 8 }) => $size}px;
  height: ${({ $size = 8 }) => $size}px;
  &::before {
    content: "";
    background-color: var(--pf-t--global--color--nonstatus--blue--default);
    width: ${({ $size = 8 }) => $size - 2}px;
    height: ${({ $size = 8 }) => $size - 2}px;
    border-radius: 50%;
    border: 1px solid var(--pf-t--global--border--color--nonstatus--blue--default);
    animation: ${pendingAnimation} 2s infinite;
  }
`;
