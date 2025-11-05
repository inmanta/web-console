import { useGetInventoryList, useGetServiceModels, useGetInstanceWithRelations } from "@/Data/Queries";
import React, { useEffect, useMemo, useState } from "react";
import { ComposerContext, composerContext } from "./Data/Context";
import { ComposerContainer, Canvas, LeftSidebar, RightSidebar } from "./UI";
import { dia, shapes, ui } from "@inmanta/rappid";
import { ComposerPaper } from "./UI/JointJsShapes/ComposerPaper";
import {
    createRelationsDictionary,
    RelationsDictionary,
    initializeCanvasFromInstance,
    createPlaceholderInstance,
    applyCoordinatesFromMetadata,
} from "./Data/Helpers";
import { ServiceEntityShape } from "./UI";

interface Props {
    editable: boolean;
    instanceId?: string;
    serviceName: string;
}

export const Composer: React.FC<Props> = ({ editable, instanceId, serviceName }) => {
    const [catalogEntries, setCatalogEntries] = useState<string[]>([]);
    const [canvasState, setCanvasState] = useState<Map<string, ServiceEntityShape>>(new Map());
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

    // Fetch instance data if instanceId is provided
    // The query will only run if instanceId and mainService are present (enabled check in the hook)
    const instanceWithRelationsQuery = useGetInstanceWithRelations(
        instanceId || "",
        false,
        mainService
    ).useOneTime();

    useEffect(() => {
        if (serviceCatalogQuery.isSuccess) {
            setCatalogEntries(serviceCatalogQuery.data.map((service) => service.name));
        }
    }, [serviceCatalogQuery.isSuccess]);

    // Initialize canvas from instance data or create placeholder for new instance
    useEffect(() => {
        if (!serviceCatalogQuery.data || !mainService || !graph || !paper || !scroller) {
            return;
        }

        let instanceData;

        if (instanceId) {
            // Case 1: Editing existing instance - wait for data to be fetched
            if (!instanceWithRelationsQuery.isSuccess || !instanceWithRelationsQuery.data) {
                return;
            }
            instanceData = instanceWithRelationsQuery.data;
        } else {
            // Case 2: Creating new instance - use placeholder
            instanceData = createPlaceholderInstance(mainService);
        }

        // Add all entities to the graph
        const initializedEntities = initializeCanvasFromInstance(
            instanceData,
            serviceCatalogQuery.data,
            relationsDictionary,
            graph
        );
        setCanvasState(initializedEntities);

        // Check if instance has saved coordinates in metadata
        const hasMetadataCoordinates =
            instanceData.instance.metadata?.coordinates;

        if (hasMetadataCoordinates) {
            try {
                const parsedMetadata = JSON.parse(instanceData.instance.metadata.coordinates);
                if (parsedMetadata.version === "v2" && parsedMetadata.data) {
                    // Apply saved coordinates from metadata (overrides manual positioning)
                    applyCoordinatesFromMetadata(graph, parsedMetadata.data);
                }
            } catch (error) {
                console.warn("Failed to parse coordinates from metadata:", error);
            }
        }

        // Unfreeze paper if it's frozen
        if (paper.isFrozen()) {
            paper.unfreeze();
        }

        // Center and zoom to fit content
        scroller.centerContent();
    }, [
        instanceId,
        instanceWithRelationsQuery.isSuccess,
        instanceWithRelationsQuery.data,
        serviceCatalogQuery.data,
        mainService,
        relationsDictionary,
        graph,
        paper,
        scroller,
    ]);

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
            canvasState: canvasState,
            setCanvasState: setCanvasState,
        }}>
            <ComposerContainer>
                <LeftSidebar />
                <Canvas />
                <RightSidebar />
            </ComposerContainer>
        </ComposerContext.Provider>
    )
}
