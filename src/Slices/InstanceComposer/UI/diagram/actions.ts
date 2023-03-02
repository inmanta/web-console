import { dia, linkTools, ui } from "@clientio/rappid";
import { AttributeModel } from "@/Core";
import { CreateModifierHandler } from "@/UI/Components";
import { MOCK_DN, MOCK_IMS, MOCK_MCX, MOCK_MPN } from "../../Core/Mock";
import {
  attributesToComposerFields,
  composerFieldsToInputs,
} from "./converters";
import { TableHighlighter } from "./highlighters";
import { ColumnData, FormInput } from "./interfaces";
import { Table } from "./shapes";

export function showLinkTools(linkView: dia.LinkView) {
  const tools = new dia.ToolsView({
    tools: [
      new linkTools.Remove({
        distance: "50%",
        markup: [
          {
            tagName: "circle",
            selector: "button",
            attributes: {
              r: 7,
              fill: "#f6f6f6",
              stroke: "#ff5148",
              "stroke-width": 2,
              cursor: "pointer",
            },
          },
          {
            tagName: "path",
            selector: "icon",
            attributes: {
              d: "M -3 -3 3 3 M -3 3 3 -3",
              fill: "none",
              stroke: "#ff5148",
              "stroke-width": 2,
              "pointer-events": "none",
            },
          },
        ],
      }),
      new linkTools.SourceArrowhead(),
      new linkTools.TargetArrowhead(),
    ],
  });
  linkView.addTools(tools);
}

export function createTable(tableView: dia.ElementView) {
  const HIGHLIGHTER_ID = "table-selected";
  const table = tableView.model as Table;

  if (TableHighlighter.get(tableView, HIGHLIGHTER_ID)) return;
  TableHighlighter.add(tableView, "root", HIGHLIGHTER_ID);
  let inputs: FormInput;
  //create Form

  const inspector = new ui.Inspector({
    cell: table,
    theme: "default",
    inputs: {
      type: {
        label: "Instance",
        type: "select",
        options: ["Select Instance Type", "MPN", "DN", "IMS", "MCX"],
      },
    },
  });
  inspector.on(
    "change:type",
    (selectedOption: "MPN" | "DN" | "MCX" | "IMS") => {
      let attributes: AttributeModel[];
      switch (selectedOption) {
        case "MPN":
          attributes = MOCK_MPN.attributes;
          break;
        case "DN":
          attributes = MOCK_DN.attributes;
          break;
        case "MCX":
          attributes = MOCK_MCX.attributes;
          break;
        case "IMS":
          attributes = MOCK_IMS.attributes;
          break;
      }
      table.setName(selectedOption);
      dialogTitleBar.textContent = selectedOption;
      dialogTitleBar.appendChild(dialogTitleTab);
      const fields = attributesToComposerFields(
        attributes,
        new CreateModifierHandler(),
        false
      );
      inputs = composerFieldsToInputs(fields);
      const newInspector = new ui.Inspector({
        cell: table,
        theme: "default",
        inputs: inputs,
      });
      newInspector.render();
      for (const input in inputs) {
        //add listeners to old inspector as it is embedded into Dialog and he gets innerHTML
        inspector.on(`change:${input}`, (cell) => {
          inputs[input].value = cell;
        });
      }
      dialog.options.content.innerHTML = newInspector.el.innerHTML;
      //Set Focus on First input
      const inputEl = inspector.el.querySelectorAll(
        "input"
      )[0] as HTMLInputElement;
      inputEl.focus();
    }
  );

  inspector.render();
  inspector.el.style.position = "relative";

  //Create and Open Dialog, with appended Form in it
  const dialog = new ui.Dialog({
    theme: "default",
    modal: false,
    draggable: true,
    closeButton: false,
    width: 300,
    title: "New Instance",
    content: inspector.el,
    buttons: [
      {
        content: "Create",
        action: "update",
        position: "left",
      },
      {
        content: "Close",
        action: "close",
      },
    ],
  });

  dialog.open(document.getElementById("canvas-wrapper") as HTMLElement);
  //Create and append Dialog Tittle
  const dialogTitleBar = dialog.el.querySelector(".titlebar") as HTMLDivElement;
  const dialogTitleTab = document.createElement("div");
  dialogTitleTab.style.background = table.getTabColor();
  dialogTitleTab.setAttribute("class", "titletab");
  dialogTitleBar.appendChild(dialogTitleTab);

  //Dialog button actions
  dialog.on("action:close", () => {
    dialog.close();
    table.remove();
  });
  dialog.on("action:update", () => {
    dialog.close();
    TableHighlighter.remove(tableView, HIGHLIGHTER_ID);
    const newColumns: ColumnData[] = [];
    for (const input in inputs) {
      newColumns.push({
        name: inputs[input].label,
        value: inputs[input].value,
      });
    }
    table.appendColumns(newColumns);
  });
}

export function editTable(tableView: dia.ElementView) {
  const HIGHLIGHTER_ID = "table-selected";
  const table = tableView.model as Table;
  const tableName = table.getName();
  if (TableHighlighter.get(tableView, HIGHLIGHTER_ID)) return;
  TableHighlighter.add(tableView, "root", HIGHLIGHTER_ID);
  //create Form
  let attributes: AttributeModel[] = [];
  switch (tableName) {
    case "MPN":
      attributes = MOCK_MPN.attributes;
      break;
    case "DN":
      attributes = MOCK_DN.attributes;
      break;
    case "MCX":
      attributes = MOCK_MCX.attributes;
      break;
    case "IMS":
      attributes = MOCK_IMS.attributes;
      break;
  }
  const fields = attributesToComposerFields(
    attributes,
    new CreateModifierHandler(),
    false
  );
  const inputs = composerFieldsToInputs(fields);
  //append values from table to input object
  const itemvalues = table.attributes.items[1];
  itemvalues.forEach((value, index) => {
    inputs[index + "/value"].value = value.label;
  });
  const inspector = new ui.Inspector({
    cell: table,
    theme: "default",
    inputs: inputs,
  });
  inspector.render();
  inspector.el.style.position = "relative";
  for (const input in inputs) {
    inspector.on(`change:${input}`, (cell) => {
      inputs[input].value = cell;
    });
  }

  inspector.render();
  inspector.el.style.position = "relative";

  //Create and Open Dialog, with appended Form in it
  const dialog = new ui.Dialog({
    theme: "default",
    modal: false,
    draggable: true,
    closeButton: false,
    width: 300,
    title: tableName,
    content: inspector.el,
    buttons: [
      {
        content: "Edit",
        action: "update",
        position: "left",
      },
      {
        content: "Close",
        action: "close",
      },
    ],
  });

  dialog.open(document.getElementById("canvas-wrapper") as HTMLElement);
  //Create and append Dialog Tittle
  const dialogTitleBar = dialog.el.querySelector(".titlebar") as HTMLDivElement;
  const dialogTitleTab = document.createElement("div");
  dialogTitleTab.style.background = table.getTabColor();
  dialogTitleTab.setAttribute("class", "titletab");
  dialogTitleBar.appendChild(dialogTitleTab);

  //Dialog button actions
  dialog.on("action:close", () => {
    dialog.close();
    TableHighlighter.remove(tableView, HIGHLIGHTER_ID);
  });
  dialog.on("action:update", () => {
    dialog.close();
    TableHighlighter.remove(tableView, HIGHLIGHTER_ID);
    const newColumns: ColumnData[] = [];
    for (const input in inputs) {
      newColumns.push({
        name: inputs[input].label,
        value: inputs[input].value,
      });
    }
    table.appendColumns(newColumns);
  });

  //Set Focus on First input
  const inputEl = inspector.el.querySelectorAll("input")[0] as HTMLInputElement;
  inputEl.focus();
}
