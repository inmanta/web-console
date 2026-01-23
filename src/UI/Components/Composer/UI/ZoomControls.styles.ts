import styled from "styled-components";

export const ZoomControlsContainer = styled.div`
  position: absolute;
  bottom: 25px;
  right: 316px;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 1rem;
  background-color: var(--pf-t--global--background--color--primary--default);
  border-radius: var(--pf-t--global--border--radius--pill);
  filter: drop-shadow(0.05rem 0.2rem 0.2rem var(--pf-t--global--box-shadow--color--100));
  z-index: 10;

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem;
    min-width: auto;
    width: 2rem;
    height: 2rem;

    &:hover {
      background: transparent;
    }

    img {
      display: block;
      margin: 0;
    }
  }

  .zoom-slider-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    output {
      color: var(--pf-t--global--text--color--subtle);
      min-width: 2.5rem;
      text-align: right;
      font-size: 0.875rem;
    }

    input[type="range"] {
      -webkit-appearance: none;
      appearance: none;
      cursor: pointer;
      width: 6rem;
      height: 0.15rem;
      margin-right: 0.5rem;
      border-radius: 0.5rem;
      --slider-background: linear-gradient(
        to right,
        var(--pf-t--global--border--color--brand--default) 0%,
        var(--pf-t--global--border--color--brand--default) 20%,
        var(--pf-t--global--border--color--nonstatus--gray--default) 20%,
        var(--pf-t--global--border--color--nonstatus--gray--default) 100%
      );
    }

    input[type="range"]:focus {
      outline: none;
    }

    /* Chrome, Safari, Opera and Edge Chromium styles */
    input[type="range"]::-webkit-slider-runnable-track {
      background: var(
        --slider-background,
        linear-gradient(
          to right,
          var(--pf-t--global--border--color--brand--default) 0%,
          var(--pf-t--global--border--color--brand--default) 20%,
          var(--pf-t--global--border--color--nonstatus--gray--default) 20%,
          var(--pf-t--global--border--color--nonstatus--gray--default) 100%
        )
      );
      border-radius: 0.5rem;
      height: 0.15rem;
    }

    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      margin-top: -3.6px;
      background-color: var(--pf-t--global--border--color--brand--default);
      border-radius: 0.5rem;
      height: 0.7rem;
      width: 0.7rem;
    }

    /* Firefox styles */
    input[type="range"]::-moz-range-track {
      background: var(
        --slider-background,
        linear-gradient(
          to right,
          var(--pf-t--global--border--color--brand--default) 0%,
          var(--pf-t--global--border--color--brand--default) 20%,
          var(--pf-t--global--border--color--nonstatus--gray--default) 20%,
          var(--pf-t--global--border--color--nonstatus--gray--default) 100%
        )
      );
      border-radius: 0.5rem;
      height: 0.15rem;
    }

    input[type="range"]::-moz-range-thumb {
      background-color: var(--pf-t--global--border--color--brand--default);
      border: none;
      border-radius: 0.5rem;
      height: 0.7rem;
      width: 0.7rem;
    }

    input[type="range"]:focus::-moz-range-thumb {
      outline: 3px solid var(--pf-t--global--border--color--brand--default);
      outline-offset: 0.125rem;
    }
  }
`;
