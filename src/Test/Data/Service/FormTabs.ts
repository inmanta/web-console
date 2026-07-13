import { EntityAnnotations, FormTabDefinition } from "@/Core";

export const general: FormTabDefinition = {
  key: "general",
  label: "General",
  order: 10,
  default: true,
};

export const network: FormTabDefinition = {
  key: "network",
  label: "Network",
  order: 20,
};

export const extras: FormTabDefinition = {
  key: "extras",
  label: "Extras",
  order: 30,
  icon: "FaCog",
};

// Intentionally not in display order: display order must come from `order`, not list position.
export const entityAnnotations: EntityAnnotations = {
  web_tabs: [network, general, extras],
};
