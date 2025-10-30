import { useGetInventoryList, useGetServiceModels } from "@/Data/Queries";
import React, { useEffect, useMemo, useState } from "react";
import { ComposerContext, composerContext } from "./Data/Context";
import { ComposerContainer, Canvas, LeftSidebar, RightSidebar } from "./UI";
import { dia, shapes, ui } from "@inmanta/rappid";
import { ComposerPaper } from "./UI/ComposerPaper";
import { createRelationsDictionary, RelationsDictionary } from "./Data/Helpers";

interface Props {
    editable: boolean;
    instanceId?: string;
    serviceName: string;
}

export const Composer: React.FC<Props> = ({ editable, instanceId, serviceName }) => {
    const [catalogEntries, setCatalogEntries] = useState<string[]>([]);
    const serviceCatalogQuery = useGetServiceModels().useContinuous();
    const relationsDictionary: RelationsDictionary = useMemo(() => createRelationsDictionary(serviceCatalogQuery.data || []), [serviceCatalogQuery.data]);

    // We could fetch the main service individually, 
    // but since we already have the full catalog, we save a call by filtering it out.
    const mainService = useMemo(() => {
        const data = serviceCatalogQuery.data;
        if (data) {
            return data.find((service) => service.name === serviceName);
        } else {
            return undefined;
        }
    }, [serviceCatalogQuery.data, serviceName]);

    const inventoriesQuery = useGetInventoryList(catalogEntries).useContinuous();

    useEffect(() => {
        if (serviceCatalogQuery.isSuccess) {
            setCatalogEntries(serviceCatalogQuery.data.map((service) => service.name));
        }
    }, [serviceCatalogQuery.isSuccess]);

    // Create graph, paper, and scroller only once using useMemo to prevent recreation on every render
    const graph = useMemo(() => new dia.Graph({}, { cellNamespace: shapes }), []);
    const paper = useMemo(() => new ComposerPaper(graph, editable).paper, [graph, editable]);
    const scroller = useMemo(() => new ui.PaperScroller({
        paper,
        cursor: "grab",
        baseWidth: 1000,
        baseHeight: 1000,
        inertia: { friction: 0.8 },
        autoResizePaper: true,
        contentOptions: function () {
            return {
                useModelGeometry: true,
                allowNewOrigin: "any",
                padding: 40,
                allowNegativeBottomRight: true,
            };
        },
    }), [paper]);

    return (
        <ComposerContext.Provider value={{
            ...composerContext,
            mainService: mainService || null,
            serviceCatalog: serviceCatalogQuery.data || [],
            serviceInventories: inventoriesQuery.data || null,
            serviceInstanceId: instanceId || null,
            paper: paper,
            graph: graph,
            scroller: scroller,
            relationsDictionary: relationsDictionary,
            editable: editable,
        }}>
            <ComposerContainer>
                <LeftSidebar />
                <Canvas />
                <RightSidebar />
            </ComposerContainer>
        </ComposerContext.Provider>
    )
}
