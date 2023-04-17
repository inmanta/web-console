import { dia, shapes, util } from "@inmanta/rappid";
import { ColumnData } from "./interfaces";

/**
 * https://resources.jointjs.com/docs/jointjs/v3.6/joint.html#shapes
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
        attrs: {
          root: {
            magnet: false,
          },
          body: {
            stroke: "#FFFFFF",
            fill: "#FFFFFF",
            strokeWidth: 1,
          },
          header: {
            fill: "#0066CC",
            stroke: "#0066CC",
            strokeWidth: 1,
          },
          headerLabel: {
            fill: "#FFFFFF",
            fontFamily: "Lekton",
            textTransform: "uppercase",
            fontSize: 12,
            textWrap: {
              ellipsis: true,
              height: 30,
            },
          },
          itemBodies_0: {
            // SVGRect which is an active magnet
            // Do not use `true` to prevent CSS effects on hover
            magnet: "item",
          },
          group_1: {
            // let the pointer events propagate to the group_0
            // which spans over 2 columns
            pointerEvents: "none",
          },
          itemLabels: {
            fontFamily: "Lekton",
            fontSize: 10,
            fill: "#000000",
            pointerEvents: "none",
          },
          itemLabels_1: {
            fill: "#7F7F7F",
            fontSize: 10,
            fontFamily: "Lekton",
            textAnchor: "end",
            x: `calc(0.5 * w - 10)`,
          },
          itemLabels_keys: {
            x: `calc(0.5 * w - 30)`,
          },
          iconsGroup_1: {
            // SVGGroup does not accept `x` attribute
            refX: "50%",
            refX2: -26,
          },
        },
      },
      super.defaults
    );
  }

  protected _setColumns(data: Array<ColumnData> = []) {
    const names: Array<{
      id: string;
      label: string;
      span: number;
    }> = [];
    const values: Array<{
      id: string;
      label: string;
    }> = [];

    data.forEach((item) => {
      if (!item.name) {
        return;
      }

      names.push({
        id: item.name,
        label: item.name,
        span: 2,
      });

      const value = {
        id: `${item.name}_value`,
        label: item.value,
      };
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
        tagName: "rect",
        selector: "tabColor",
      },
      {
        tagName: "text",
        selector: "headerLabel",
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
    return this.attr(["headerLabel", "text"], name, options);
  }

  getName(): string {
    return this.attr(["headerLabel", "text"]);
  }
  setColumns(data: Array<ColumnData>) {
    this.set("columns", data);
    return this;
  }
  appendColumns(data: Array<ColumnData>) {
    this._setColumns(data);
    return this;
  }

  toJSON() {
    const json = super.toJSON();
    // keeping only the `columns` attribute
    delete json.items;
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
