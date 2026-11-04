import styled from "styled-components";

export const ComposerContainer = styled.div`
  display: flex;
  width: 100%;
  height: calc(80vh - 170px);
  border-radius: var(--pf-t--global--border--radius--small);
  color: var(--pf-t--global--text--color--regular);
  position: relative;
  margin: 0;
  overflow: hidden;
  border: 1px solid var(--pf-t--global--border--color--default);

  &.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
  }
`;
