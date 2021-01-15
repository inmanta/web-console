const dict = {
  "inventory.column.id": "Id",
  "inventory.column.state": "State",
  "inventory.column.attributes": "Attributes",
  "inventory.column.createdAt": "Created",
  "inventory.column.updatedAt": "Updated",
};

type Key = keyof typeof dict;

export const content = (key: Key): string => dict[key];
