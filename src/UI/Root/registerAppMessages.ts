import { FeatureModule, registerMessages } from "@inmanta/web-console-core";
import { coreMessages } from "@inmanta/web-console-core/messages";
import { uiMessages } from "@inmanta/web-console-ui/messages";

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
  features.forEach(({ messages }) => messages && registerMessages(messages));
};
