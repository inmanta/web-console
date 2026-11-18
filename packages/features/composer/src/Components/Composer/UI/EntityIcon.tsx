import React from "react";
import { PuzzlePieceIcon } from "@patternfly/react-icons/dist/esm/icons/puzzle-piece-icon";
import { EmbeddedEntity, getServiceIconName, ServiceModel } from "@inmanta/web-console-core";
import { DynamicFAIcon } from "@inmanta/web-console-ui/Components/FaIcon";

/**
 * The icon of an entity on a card or in the palette, in the color of the text around it.
 * A service shows its `web_icon`, with the same fallback as the service catalog. An embedded
 * entity has no icon of its own and the catalog doesn't list it, so it shows the embedded
 * entity icon.
 */
export const EntityIcon: React.FC<{ serviceModel: ServiceModel | EmbeddedEntity }> = ({
  serviceModel,
}) =>
  "owned_entities" in serviceModel ? (
    <DynamicFAIcon icon={getServiceIconName(serviceModel)} isInline />
  ) : (
    <PuzzlePieceIcon />
  );
