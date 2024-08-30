import React, { useEffect, useState } from "react";
import { dia } from "@inmanta/rappid";
import { Field, InstanceAttributeModel } from "@/Core";
import { DiagramHandlers } from "../init";
import {
  ComposerServiceOrderItem,
  DictDialogData,
  StencilState,
} from "../interfaces";
import { CanvasContext } from "./Context";

/**
 * CanvasProvider component
 *
 * This component is a context provider for the Canvas component and it's children.
 * It maintains the state for various properties related to the canvas and also provides functions to update these states.
 *
 * @param {React.PropsWithChildren<unknown>} props - The properties that define the behavior and display of the component.
 * @param {React.ReactNode} props.children - The children components to be wrapped by the provider.
 *
 * @returns {React.FC<React.PropsWithChildren<unknown>>} The CanvasProvider component.
 */
export const CanvasProvider: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  const [looseEmbedded, setLooseEmbedded] = useState<Set<string>>(new Set());
  const [cellToEdit, setCellToEdit] = useState<dia.CellView | null>(null);
  const [dictToDisplay, setDictToDisplay] = useState<DictDialogData | null>(
    null,
  );
  const [fields, setFields] = useState<Field[]>([]);
  const [formState, setFormState] = useState<InstanceAttributeModel>({});
  const [instancesToSend, setInstancesToSend] = useState<
    Map<string, ComposerServiceOrderItem>
  >(new Map());
  const [isDirty, setIsDirty] = useState(false);
  const [diagramHandlers, setDiagramHandlers] =
    useState<DiagramHandlers | null>(null);
  const [stencilState, setStencilState] = useState<StencilState | null>(null);

  useEffect(() => {
    if (!isDirty) {
      setIsDirty(
        Array.from(instancesToSend).filter(
          ([_key, item]) => item.action !== null,
        ).length > 0,
      );
    }
  }, [instancesToSend, isDirty]);

  return (
    <CanvasContext.Provider
      value={{
        diagramHandlers,
        setDiagramHandlers: (value: DiagramHandlers) => {
          setDiagramHandlers(value);
        },
        dictToDisplay,
        setDictToDisplay: (value: DictDialogData | null) => {
          setDictToDisplay(value);
        },
        cellToEdit,
        setCellToEdit: (value: dia.CellView | null) => {
          setCellToEdit(value);
        },
        looseEmbedded,
        setLooseEmbedded: (value: Set<string>) => {
          setLooseEmbedded(value);
        },
        fields,
        setFields: (value: Field[]) => {
          setFields(value);
        },
        formState,
        setFormState: (value: InstanceAttributeModel) => {
          setFormState(value);
        },
        instancesToSend,
        setInstancesToSend,
        stencilState,
        setStencilState,
        isDirty,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};
