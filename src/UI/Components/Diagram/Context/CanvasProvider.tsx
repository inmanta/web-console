import React, { useEffect, useState } from "react";
import { dia } from "@inmanta/rappid";
import { Field, InstanceAttributeModel } from "@/Core";
import { DiagramHandlers } from "../init";
import {
  ComposerServiceOrderItem,
  DictDialogData,
  StencilState,
  RelationCounterForCell,
} from "../interfaces";
import { CanvasContext } from "./Context";

/**
 * CanvasProvider component
 *
 * This component is a context provider for the Canvas component and its children.
 * It maintains the state for various properties related to the canvas and also provides functions to update these states.
 *
 * @props {React.PropsWithChildren<unknown>} props - The properties that define the behavior and display of the component.
 * @prop {React.ReactNode} children - The children components to be wrapped by the provider.
 *
 * @returns {React.FC<React.PropsWithChildren<unknown>>} The CanvasProvider component.
 */
export const CanvasProvider: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  const [looseElement, setLooseElement] = useState<Set<string>>(new Set());
  const [cellToEdit, setCellToEdit] = useState<dia.CellView | null>(null);
  const [dictToDisplay, setDictToDisplay] = useState<DictDialogData | null>(
    null,
  );
  const [fields, setFields] = useState<Field[]>([]);
  const [formState, setFormState] = useState<InstanceAttributeModel>({});
  const [serviceOrderItems, setServiceOrderItems] = useState<
    Map<string, ComposerServiceOrderItem>
  >(new Map());
  const [isDirty, setIsDirty] = useState(false);
  const [diagramHandlers, setDiagramHandlers] =
    useState<DiagramHandlers | null>(null);
  const [stencilState, setStencilState] = useState<StencilState | null>(null);
  const [interServiceRelationsOnCanvas, setInterServiceRelationsOnCanvas] =
    useState<Map<string, RelationCounterForCell>>(new Map());

  useEffect(() => {
    // check if any of the edited serviceOrderItems got its action changed from default - its a condition to disable the deploy button when we are in the edit view
    if (!isDirty) {
      setIsDirty(
        Array.from(serviceOrderItems).filter(
          ([_key, item]) => item.action !== null,
        ).length > 0,
      );
    }
  }, [serviceOrderItems, isDirty]);

  return (
    <CanvasContext.Provider
      value={{
        diagramHandlers,
        setDiagramHandlers,

        dictToDisplay,
        setDictToDisplay,

        cellToEdit,
        setCellToEdit,

        looseElement,
        setLooseElement,

        fields,
        setFields,

        formState,
        setFormState,

        interServiceRelationsOnCanvas,
        setInterServiceRelationsOnCanvas,

        serviceOrderItems,
        setServiceOrderItems,

        stencilState,
        setStencilState,

        isDirty,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};
