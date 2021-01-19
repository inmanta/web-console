const dict = {
  "inventory.column.id": "Id",
  "inventory.column.state": "State",
  "inventory.column.attributesSummary": "Attributes",
  "inventory.column.createdAt": "Created",
  "inventory.column.updatedAt": "Updated",
  "inventory.column.actions": "Actions",
};

type Key = keyof typeof dict;

export const words = (key: Key): string => dict[key];
