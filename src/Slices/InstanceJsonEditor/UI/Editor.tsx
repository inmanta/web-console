/* eslint-disable */
import React, { useCallback, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@patternfly/react-core";
import { EmbeddedEntity, ServiceModel } from "@/Core";
import { DependencyContext } from "@/UI";
import {
  CreateModifierHandler,
  FieldCreator,
  createFormState,
} from "@/UI/Components";
import Editor from "./EditorBase";
import { getSchema } from "./Utils";

interface Props {
  serviceEntity: ServiceModel;
}

export const CreateInstanceEditor: React.FC<Props> = ({ serviceEntity }) => {
  // const ajv = new Ajv();
  const { commandResolver, environmentModifier, routeManager } =
    useContext(DependencyContext);
  // const [errorMessage, setErrorMessage] = useState("");
  const [hint, setHint] = useState("");
  // const isHalted = environmentModifier.useIsHalted();
  const navigate = useNavigate();
  const url = routeManager.useUrl("Inventory", {
    service: serviceEntity.name,
  });
  const fieldCreator = new FieldCreator(new CreateModifierHandler());
  const fields = fieldCreator.create(serviceEntity);
  const [initialValue] = useState(createFormState(fields));
  const [schema] = useState(getSchema(serviceEntity));
  // const [templates, setTemplates] = useState(null);
  const handleRedirect = useCallback(
    () => navigate(url),
    [navigate] /* eslint-disable-line react-hooks/exhaustive-deps */,
  );

  const trigger = commandResolver.useGetTrigger<"CreateInstance">({
    kind: "CreateInstance",
    service_entity: serviceEntity.name,
  });

  //   const onSubmit = async (
  //     attributes: InstanceAttributeModel,
  //     setIsDirty: (values: boolean) => void,
  //   ) => {
  //     //as setState used in setIsDirty doesn't change immediately we cannot use it only before handleRedirect() as it would trigger prompt from ServiceInstanceForm
  //     setIsDirty(false);
  //     const result = await trigger(fields, attributes);
  //     if (result.kind === "Left") {
  //       setIsDirty(true);
  //       setErrorMessage(result.value);
  //     } else {
  //       handleRedirect();
  //     }
  //   };

  const getSchemaByPath = (schema, pathArray: string[]) => {
    let location = schema;

    for (let index = 0; index < pathArray.length; index++) {
      //  console.log(location.properties)
      const path = pathArray[index];
      if (location.properties && location.properties[path]) {
        location = location.properties[path];
      }
    }
    return location;
  };

  const getEntityModelByPath = (pathArray: string[]) => {
    let location: ServiceModel | EmbeddedEntity = serviceEntity;

    if (pathArray.length === 1) {
      return location.attributes.find((item) => item.name === pathArray[0]);
    }

    for (let index = 0; index < pathArray.length; index++) {
      const path = pathArray[index];

      // check in the embedded_entities.
      if (serviceEntity.embedded_entities) {
        serviceEntity.embedded_entities.forEach((entity) => {
          if (entity.name === path) {
            location = entity;
          }
        });
      }

      // check in the relations
      if (serviceEntity.inter_service_relations) {
      }
    }

    return location;
  };

  const handleEvent = (node, event) => {
    if (event.type === "click" && node.field) {
      // add hint
      const currentSchema = getSchemaByPath(schema, node.path);
      setHint(currentSchema.description || "no description available");
    }
  };

  const createMenu = (items, node) => {
    const entityModel = getEntityModelByPath(node.path);
    const entitySchema = getSchemaByPath(schema, node.path);
    console.log(entitySchema, entityModel);

    return items;
  };

  return (
    <>
      <Card>Description: {hint}</Card>
      <Editor
        value={initialValue}
        onEvent={handleEvent}
        name={serviceEntity.name}
        onCreateMenu={createMenu}
      />
    </>
  );
};
