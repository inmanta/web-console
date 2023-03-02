import { ui } from "@clientio/rappid";
const Position = ui.Halo.HandlePosition;

export class HaloService {
  create(cellView: joint.dia.CellView, callback) {
    new ui.Halo({
      cellView,
      handles: this.getHaloConfig(),
      useModelGeometry: true,
    })
      .addHandle({
        name: "myaction",
        position: Position.NE,
        icon: "myaction.png",
      })
      .on("action:myaction:pointerdown", function (evt) {
        evt.stopPropagation();
        callback();
      })
      .render();
  }

  getHaloConfig() {
    return [
      {
        name: "remove",
        position: Position.NW,
        events: { pointerdown: "removeElement" },
        attrs: {
          ".handle": {
            "data-tooltip-class-name": "small",
            "data-tooltip": "Click to remove the object",
            "data-tooltip-position": "right",
            "data-tooltip-padding": 15,
          },
        },
      },
      {
        name: "unlink",
        position: Position.SW,
        events: { pointerdown: "unlinkElement" },
        attrs: {
          ".handle": {
            "data-tooltip-class-name": "small",
            "data-tooltip": "Click to break all connections to other objects",
            "data-tooltip-position": "right",
            "data-tooltip-padding": 15,
          },
        },
      },
      {
        name: "link",
        position: Position.SE,
        events: {
          pointerdown: "startLinking",
          pointermove: "doLink",
          pointerup: "stopLinking",
        },
        attrs: {
          ".handle": {
            "data-tooltip-class-name": "small",
            "data-tooltip": "Click and drag to connect the object",
            "data-tooltip-position": "left",
            "data-tooltip-padding": 15,
          },
        },
      },
    ];
  }
}
