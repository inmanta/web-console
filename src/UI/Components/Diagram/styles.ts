import styled from "styled-components";

export const CanvasWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background: #f3f7f6;
  margin: 0;
  font-family: sans-serif;
  overflow: hidden;
  .canvas {
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    position: absolute;
    background: #f3f7f6;

    .joint-element {
      filter: drop-shadow(0.1rem 0.1rem 0.15rem rgba(0, 0, 0, 0.2));
    }
    .joint-paper-background {
      background: #f3f7f6;
    }

    /* [magnet="item"]:hover,
    .column-connected {
      fill: #efefef;
      stroke: #dddddd;
    } */

    .source-arrowhead,
    .target-arrowhead {
      fill: #a0a0a0;
      stroke-width: 1;
    }
  }

  /* 
    ***  ui.Dialog ***
*/

  .joint-dialog.joint-theme-default {
    .body {
      padding: 0;
      max-height: 500px;
      overflow-y: scroll;
    }

    .fg {
      border: none;
      border-radius: 0px;
      filter: drop-shadow(0.1rem 0.1rem 0.15rem rgba(0, 0, 0, 0.2));
    }

    .titlebar {
      padding: 16px;
      border-radius: 0px;
      color: #3d3d3d;
      background: #fff;
      border: none;
      border-bottom: 1px solid #dddddd;
      font-size: 20px;

      .titletab {
        height: 5px;
        position: absolute;
        top: -5px;
        left: 0;
        width: 100%;
      }
    }

    .controls {
      border: none;
      border-top: 1px solid #dddddd;

      & .control-button {
        color: #303030;
        border: 1px solid #ccc;
        background: #fff;
        border-radius: 0px;
        min-width: 82px;

        &:hover {
          border: 1px solid #ccc;
          background: #ccc;
          opacity: 0.8;
          transition: 0.1s linear;
        }
        // Remove button
        &.left {
          color: #f8f8ff;
          background: blue;
          border: 1px solid blue;
        }
      }
    }
  }

  /* 
    ***  ui.Inspector ***
*/

  .joint-inspector.joint-theme-default {
    border: none;
    background: #fff;
    padding: 5px 16px;

    .field {
      padding: 0;
    }

    // Column Elements
    .list-item {
      color: #636363;
      background: #fff;
      border: none;
      border-top: 1px solid #ccc;
      box-shadow: none;
      padding: 0;
      padding-top: 12px;
      padding-bottom: 16px;
      margin: 0;

      display: flex;
      flex-direction: column;
    }

    .btn-list-add,
    .btn-list-del {
      margin: 0;
      height: 30px;
      background: transparent;
      color: #f8f8ff;
      box-shadow: none;
      border-radius: 0px;

      &:hover,
      &:hover {
        transition: 0.1s linear;
      }
    }

    .btn-list-add {
      margin-top: 4px;
      margin-bottom: 8px;
      width: 100%;
      background: #015eff;
      border: 1px solid #015eff;

      &:hover {
        opacity: 0.8;
      }
    }

    .btn-list-del {
      order: 4;
      align-self: flex-end;
      margin-top: 8px;
      text-align: center;
      min-width: 82px;
      color: blue;
      border: 1px solid blue;

      &:hover {
        color: #f8f8ff;
        background: blue;
      }
    }

    // Text Labels

    label,
    output,
    .units {
      color: #3d3d3d;
      text-transform: none;
      text-shadow: none;
      font-size: 12px;
      margin: 0;
      line-height: 28px;
    }

    label:after {
      content: "";
    }

    // Inputs
    input[type="text"],
    input[type="number"],
    textarea,
    .content-editable,
    select {
      margin-bottom: 12px;
      width: 100%;
      height: auto;
      line-height: 16px;
      text-shadow: none;
      box-shadow: none;
      box-sizing: border-box;
      outline: none;
      padding: 16px 12px;
      overflow: auto;

      color: #303030;
      background: #fff;
      border: 1px solid #ccc;
      border-radius: 0px;
    }

    // Select Input
    select {
      background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="none" stroke-width="2" stroke="grey"><path d="M6 9l6 6 6-6"/></svg>');
      background-repeat: no-repeat;
      background-position-x: 100%;
      background-position-y: 50%;
      background-origin: content-box;

      -webkit-appearance: none;
      cursor: pointer;

      &::-ms-expand {
        display: none;
      }
    }

    // Color Input
    input[type="color"] {
      cursor: pointer;
      margin-bottom: 12px;
    }

    // Toggle
    .toggle {
      width: 40px;
      height: 20px;

      & span,
      & input:checked + span {
        border: 1px solid #015eff;
        background: #015eff;
      }

      & span,
      & input:not(:checked) + span {
        border: 1px solid #ccc;
        background: #ccc;
      }

      & span {
        box-shadow: none;
      }

      & span i:before {
        content: "";
      }

      & input:checked + span i:before {
        content: "";
      }

      & span i {
        background: #fff;
        transition: 0.2s;
      }
    }
  }
`;
