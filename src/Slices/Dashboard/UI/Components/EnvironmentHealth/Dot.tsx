import styled from "styled-components";

/**
 * Small colored dot used as a compact status marker (Environment Health columns, checklist items).
 */
export const Dot = styled.span<{ $color: string }>`
  display: inline-block;
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${(props) => props.$color};
`;
