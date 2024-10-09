import styled from "styled-components";

// The height is calculated to fit the tabs neatly into the page.
// The 330px equals total height of the elements above the tabs with a short margin.
export const TabContentWrapper = styled.div`
  max-height: calc(100vh - 350px);
  padding-top: var(--pf-v5-global--spacer--xl);
  overflow: auto;
`;
