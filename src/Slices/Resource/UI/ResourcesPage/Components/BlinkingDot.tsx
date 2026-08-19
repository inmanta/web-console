import React from "react";
import styled, { css, keyframes } from "styled-components";
import { useReducedAnimations } from "@/UI/Components/ReducedAnimations/useReducedAnimations";

//Indication colors based on <Label color="blue" /> component
const pendingAnimation = keyframes`
 0% { opacity: .2}
 50% { opacity: 1}
 100% { opacity: .2}
`;

const StyledBlinkingDot = styled.span<{
  $size?: number;
  $reducedAnimations: boolean;
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
    ${({ $reducedAnimations }) =>
      $reducedAnimations
        ? css`
            opacity: 1;
          `
        : css`
            animation: ${pendingAnimation} 2s infinite;
            will-change: opacity;
          `}
  }
`;

interface Props extends React.ComponentPropsWithoutRef<"span"> {
  $size?: number;
}

/**
 * A small blue dot indicating an in-progress/deploying state.
 *
 * Pulses continuously unless the user has opted into the "reduce animations"
 * preference (offered via a banner when many resources are deploying at once),
 * in which case it renders as a static, fully-opaque dot instead.
 */
export const BlinkingDot: React.FC<Props> = ({ $size, ...rest }) => {
  const { reducedAnimations } = useReducedAnimations();

  return <StyledBlinkingDot $size={$size} $reducedAnimations={reducedAnimations} {...rest} />;
};
