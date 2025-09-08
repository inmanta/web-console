import { dia, shapes } from "@inmanta/rappid";
import { updateLabelPosition } from "../Helpers";

interface LinkAttributeContext {
  model: dia.Link;
}

export const Link = shapes.standard.Link.define(
  "Link",
  {
    // attributes
    z: -1,
    attrs: {
      wrapper: {
        connection: true,
        strokeWidth: 10,
      },
      line: {
        class: "joint-link-line",
        targetMarker: {
          class: "joint-link-marker",
          type: "path",
          d: "M 0 -5 10 0 0 5 z",
        },
        sourceMarker: {
          class: "joint-link-marker",
          type: "path",
          d: "M 0 -5 10 0 0 5 z",
        },
        connection: true,
        strokeWidth: 2,
      },
    },
  },
  {
    // prototype
  },
  {
    // static
    attributes: {
      "auto-orient": {
        qualify: function (this: LinkAttributeContext) {
          return this.model.isLink();
        },
        set: updateLabelPosition,
      },
    },
  }
);

const LinkView = dia.LinkView.extend({
  update(...theArgs) {
    dia.LinkView.prototype.update.apply(this, theArgs as []);
    this.updateLabels();
  },
});

Object.assign(shapes, {
  LinkView,
  Link,
});
