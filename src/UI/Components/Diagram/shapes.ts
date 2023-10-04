import { dia, shapes, util } from "@inmanta/rappid";
import expandButton from "./icons/expand-icon.svg";
import { ColumnData } from "./interfaces";

export const Colors = {
  base: "#0066CC",
  core: "#F0AB00",
  embedded: "#009596",
};

/**
 * https://resources.jointjs.com/tutorial/custom-elements
 * https://resources.jointjs.com/tutorial/ts-shape
 */
export class ServiceEntityBlock extends shapes.standard.HeaderedRecord {
  defaults() {
    return util.defaultsDeep(
      {
        type: "app.ServiceEntityBlock",
        columns: [],
        padding: { top: 40, bottom: 10, left: 10, right: 10 },
        size: { width: 176 },
        itemMinLabelWidth: 80,
        itemHeight: 22,
        itemOffset: 0,
        itemOverflow: true,
        isCollapsed: false,
        attrs: {
          body: {
            stroke: "#FFFFFF",
            fill: "#FFFFFF",
            strokeWidth: 1,
            cursor: "default",
          },
          header: {
            fill: Colors.core,
            stroke: Colors.core,
            strokeWidth: 1,
            cursor: "grab",
          },
          headerLabel: {
            fill: "#FFFFFF",
            fontFamily:
              "RedHatText, Overpass, overpass, helvetica, arial, sans-serif",
            textTransform: "uppercase",
            fontSize: 12,
            textWrap: {
              ellipsis: true,
              height: 30,
            },
            cursor: "grab",
          },
          group_1: {
            cursor: "default",
          },
          itemBodies: {
            cursor: "default",
          },
          itemLabels: {
            fontFamily:
              "RedHatText, Overpass, overpass, helvetica, arial, sans-serif",
            fontSize: 10,
            fill: "#000000",
            //pointerEvents: "none",
            cursor: "default",
            itemText: {
              textWrap: false,
            },
          },
          itemLabels_1: {
            fill: "#7F7F7F",
            fontSize: 10,
            fontFamily:
              "RedHatText, Overpass, overpass, helvetica, arial, sans-serif",
            textAnchor: "end",
            x: `calc(0.5 * w - 10)`,
            cursor: "default",
          },
        },
      },
      super.defaults,
    );
  }

  protected _setColumns(data: Array<ColumnData> = [], initialSetting = true) {
    const names: Array<{
      id: string;
      label: string;
      span: number;
    }> = [];
    const values: Array<{
      id: string;
      label: string;
    }> = [];
    let dataToIterate = [...data];

    if (initialSetting && data.length > 4) {
      this.set("dataToDisplay", data);
      this.set("isCollapsed", true);
      dataToIterate = data.slice(0, 4);
    }

    dataToIterate.forEach((item) => {
      if (!item.name) {
        return;
      }
      const nameObject = {
        id: item.name,
        label: item.name,
        span: 2,
      };

      //out-of-the-box headeredRecord doesn't truncate attribute name, only their values
      const truncatedName = util.breakText(
        item.name.toString(),
        { width: 80, height: 22 },
        {
          "font-size": this.attr("itemLabels_1/fontSize"),
          "font-family": this.attr("itemLabels_1/fontFamily"),
        },
        {
          ellipsis: true,
        },
      );

      if (truncatedName.includes(`\u2026`)) {
        this.attr(`itemLabel_${item.name}/data-tooltip`, item.name);
        this.attr(`itemLabel_${item.name}/data-tooltip-position`, "right");

        names.push({ ...nameObject, label: item.name.slice(0, 11) + `\u2026` });
      } else {
        names.push(nameObject);
      }

      const value: { id: string; label: string } = {
        id: `${item.name}_value`,
        label: "",
      };

      if (
        typeof item.value === "object" &&
        !Array.isArray(item.value) &&
        item.value !== null
      ) {
        console.log(typeof item.value, item.value);
        value.label = "{...}";

        ///Add event and add data to display in Dictionary Modal
        this.attr(`itemLabel_${item.name}_value/event`, "element:showDict");
        this.attr(
          `itemLabel_${item.name}_value/dict`,
          JSON.stringify({
            title: item.name,
            value: item.value,
          }),
        );
        this.attr(`itemLabel_${item.name}_value/cursor`, "pointer");
      } else {
        value.label = item.value;

        if (item.value !== undefined && item.value !== null) {
          //reproduce internal formatting of the text base on actual dimensions, if text includes elipsis add Tooltip
          const reproducedDisplayText = util.breakText(
            item.value.toString().replace(/\s+/g, " "),
            { width: 80, height: 22 },
            {
              "font-size": this.attr("itemLabels_1/fontSize"),
              "font-family": this.attr("itemLabels_1/fontFamily"),
            },
            {
              ellipsis: true,
            },
          );

          if (reproducedDisplayText.includes(`\u2026`)) {
            value.label =
              item.value.toString().replace(/\s+/g, " ").slice(0, 10) +
              `\u2026`;
            this.attr(`itemLabel_${item.name}_value/data-tooltip`, item.value);
          }
        }
      }
      values.push(value);
    });

    this.set("items", [names, values]);
    this.removeInvalidLinks();
    return this;
  }

  preinitialize(): void {
    this.markup = [
      {
        tagName: "rect",
        selector: "body",
      },
      {
        tagName: "rect",
        selector: "header",
      },
      {
        tagName: "text",
        selector: "headerLabel",
      },
      {
        tagName: "image",
        selector: "info",
      },
      {
        tagName: "rect",
        selector: "spacer",
      },
      {
        tagName: "image",
        selector: "button",
      },
    ];
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  initialize(...args: any[]) {
    super.initialize(...args);
    this._setColumns(this.get("columns"));
  }

  onColumnsChange() {
    if (this.hasChanged("columns")) {
      this._setColumns(this.get("columns"));
    }
  }

  setName(name: string, options?: object) {
    const shortenName = util.breakText(
      name,
      { width: 140, height: 30 },
      {
        "font-size": this.attr("headerLabel/fontSize"),
        "font-family": this.attr("headerLabel/fontFamily"),
      },
      {
        ellipsis: true,
      },
    );

    this.set("entityName", name);
    return this.attr(["headerLabel", "text"], shortenName, options);
  }

  getRelations(): Map<string, string> | null {
    const relations = this.get("relatedTo");
    return relations ? relations : null;
  }

  addRelation(id: string, relationName: string): void {
    const currentRelation = this.getRelations();

    if (currentRelation) {
      this.set("relatedTo", currentRelation.set(id, relationName));
    } else {
      const relationMap = new Map();
      this.set("relatedTo", relationMap.set(id, relationName));
    }
  }

  removeRelation(id: string): boolean {
    const currentRelation = this.getRelations();
    let wasThereRelationToRemove = false;
    if (currentRelation) {
      wasThereRelationToRemove = currentRelation.delete(id);
      this.set("relatedTo", currentRelation);
    }
    return wasThereRelationToRemove;
  }

  getName(): string {
    return this.get("entityName");
  }

  setTabColor(color: string) {
    this.attr(["header", "fill"], color);
    return this.attr(["header", "stroke"], color);
  }

  appendColumns(data: Array<ColumnData>, initializeButton = true) {
    this._setColumns(data, initializeButton);

    if (initializeButton && this.get("isCollapsed")) {
      this.appendButton();
    }
    return this;
  }

  editColumns(data: Array<ColumnData>, shouldBeCollapsed = true) {
    this._setColumns(data, shouldBeCollapsed);
    return this;
  }

  appendButton() {
    this.set("padding", {
      bottom: 44,
      left: 10,
      right: 10,
      top: 40,
    });

    const bbox = this.getBBox();
    this.attr("spacer", {
      fill: "#000",
      stroke: "#000",
      opacity: 0.1,
      strokeWidth: 1,
      y: bbox.height - 33,
      width: 180,
      height: 1,
      cursor: "default",
    });

    this.attr("button", {
      event: "element:button:pointerdown",
      "xlink:href": expandButton,
      preserveAspectRatio: "none",
      cursor: "pointer",
      y: bbox.height - 24,
      x: bbox.width / 2 - 8,
      width: 16,
      height: 16,
    });
  }

  toJSON() {
    const json = super.toJSON();
    // keeping only the `items` attribute as columns are omitted in our use-case
    delete json.columns;
    return json;
  }
}

export class EntityConnection extends dia.Link {
  defaults() {
    return {
      ...super.defaults,
      type: "app.Link",
      z: -1,
      attrs: {
        wrapper: {
          connection: true,
          strokeWidth: 10,
        },
        line: {
          targetMarker: {
            type: "path",
            d: "M 0 -5 10 0 0 5 z",
          },
          sourceMarker: {
            type: "path",
            d: "M 0 -5 10 0 0 5 z",
          },
          connection: true,
          stroke: "#A0A0A0",
          strokeWidth: 2,
        },
      },
    };
  }
  markup = [
    {
      tagName: "path",
      selector: "wrapper",
      attributes: {
        fill: "none",
        stroke: "transparent",
      },
    },
    {
      tagName: "path",
      selector: "line",
      attributes: {
        fill: "none",
      },
    },
  ];
}

const TableView = shapes.standard.RecordView;

Object.assign(shapes, {
  app: {
    ServiceEntityBlock,
    TableView,
    EntityConnection,
  },
});
