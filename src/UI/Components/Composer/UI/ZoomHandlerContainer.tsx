import styled from "styled-components";

/**
 * Container for the zoom & fullscreen tools from JointJS
 */
export const ZoomHandlerContainer = styled.div`
  position: absolute;
  bottom: 25px;
  right: 316px;
  filter: drop-shadow(0.05rem 0.2rem 0.2rem var(--pf-t--global--box-shadow--color--100));

  .joint-toolbar {
    padding: 0.5rem 2rem;
    border-radius: var(--pf-t--global--border--radius--pill);
  }

  button.joint-widget.joint-theme-default {
    &:hover {
      background: transparent;
    }
  }

  .joint-widget.joint-theme-default {
    --slider-background: linear-gradient(
      to right,
      var(--pf-t--global--border--color--brand--default) 0%,
      var(--pf-t--global--border--color--brand--default) 20%,
      var(--pf-t--global--border--color--nonstatus--gray--default) 20%,
      var(--pf-t--global--border--color--nonstatus--gray--default) 100%
    );

    output {
      color: var(--pf-t--global--text--color--subtle);
    }

    .units {
      color: var(--pf-t--global--text--color--subtle);
    }

    /*********** Baseline, reset styles ***********/
    input[type="range"] {
      -webkit-appearance: none;
      appearance: none;
      background: var(--slider-background);
      cursor: pointer;
      width: 8rem;
      height: 0.15rem;
      margin-right: 0.5rem;
    }

    /* Removes default focus */
    input[type="range"]:focus {
      outline: none;
    }

    /******** Chrome, Safari, Opera and Edge Chromium styles ********/
    /* slider track */
    input[type="range"]::-webkit-slider-runnable-track {
      background: var(--slider-background);
      border-radius: 0.5rem;
      height: 0.15rem;
    }

    /* slider thumb */
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none; /* Override default look */
      appearance: none;
      margin-top: -3.6px; /* Centers thumb on the track */
      background-color: var(--pf-t--global--border--color--brand--default);
      border-radius: 0.5rem;
      height: 0.7rem;
      width: 0.7rem;
    }

    /*********** Firefox styles ***********/
    /* slider track */
    input[type="range"]::-moz-range-track {
      background-color: var(--slider-background);
      border-radius: 0.5rem;
      height: 0.15rem;
    }

    /* slider thumb */
    input[type="range"]::-moz-range-thumb {
      background-color: var(--pf-t--global--border--color--brand--default);
      border: none; /*Removes extra border that FF applies*/
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
