import { FeatureModule, registerMessages } from "@/Core";
import { coreMessages } from "@/Core/messages";
import { uiMessages } from "@/UI/Components/messages";

/**
 * Registers the English messages of the web-console core layer, the shared components and the
 * given features, so `words` can return them. The shell's own messages come with `shellFeature`.
 * Call it before anything is rendered.
 *
 * @param features - the features of the app
 */
export const registerAppMessages = (features: FeatureModule[]): void => {
  registerMessages(coreMessages);
  registerMessages(uiMessages);
  features.forEach(({ translations }) => translations && registerMessages(translations));
};
