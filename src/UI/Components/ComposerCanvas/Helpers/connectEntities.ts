import { dia } from "@inmanta/rappid";
import { Link, ServiceEntityBlock } from "../Shapes";

/**
 * Function that creates connection/link between two Entities
 *
 * @param {dia.Graph} graph JointJS graph object
 * @param {ServiceEntityBlock} source JointJS shape object
 * @param {ServiceEntityBlock[]} target JointJS shape objects
 * @param {boolean} isBlocked parameter determining whether we are showing tools for linkView
 * @returns {void}
 */
export const connectEntities = (
  graph: dia.Graph,
  source: ServiceEntityBlock,
  targets: ServiceEntityBlock[],
  isBlocked?: boolean
): void => {
  targets.map((target) => {
    const link = new Link();

    if (isBlocked) {
      link.set("isBlockedFromEditing", isBlocked);
    }

    link.source(source);
    link.target(target);
    graph.addCell(link);
    graph.trigger("link:connect", link);
  });
};
