import { dia } from "@inmanta/rappid";
import { RelationsDictionary } from ".";

export const checkIfConnectionIsAllowed = (
    graph: dia.Graph,
    targetView: dia.CellView | dia.ElementView | undefined,
    sourceView: dia.CellView | dia.ElementView,
    relationsDictionary: RelationsDictionary
) => {
    return true;
}