import {
  PathHelper,
  TreeExpansionManager,
} from "@/UI/Components/TreeTable/Helpers";
import { CatalogAttributeHelper } from "./AttributeHelper";
import { CatalogTreeTableHelper } from "./TreeTableHelper";

test("TreeTableHelper getExpansionState returns correct expansionState", () => {
  const service = {
    attributes: [{ name: "e", type: "string", description: "" }],
    embedded_entities: [
      {
        name: "a",
        description: "",
        attributes: [{ name: "b", type: "int?", description: "desc" }],
        embedded_entities: [],
      },
    ],
  };
  const treeTableHelper = new CatalogTreeTableHelper(
    new PathHelper("."),
    new TreeExpansionManager("."),
    new CatalogAttributeHelper("."),
    service
  );
  const expansionState = treeTableHelper.getExpansionState();
  expect(expansionState).toEqual({
    a: false,
    "a.b": false,
    e: false,
  });
});

test("TreeTableHelper createRows returns correctly ordered list", () => {
  const service = {
    attributes: [{ name: "e", type: "string", description: "" }],
    embedded_entities: [
      {
        name: "f",
        description: "description",
        attributes: [{ name: "g", type: "dict?", description: "sample" }],
        embedded_entities: [],
      },
      {
        name: "a",
        description: "",
        attributes: [{ name: "b", type: "int?", description: "desc" }],
        embedded_entities: [
          {
            name: "c",
            description: "desc",
            attributes: [{ name: "d", type: "int", description: "desc" }],
            embedded_entities: [],
          },
        ],
      },
    ],
  };

  const treeTableHelper = new CatalogTreeTableHelper(
    new PathHelper("$"),
    new TreeExpansionManager("$"),
    new CatalogAttributeHelper("$"),
    service
  );

  const cb = jest.fn;
  const rows = treeTableHelper.createRows(
    {
      a: false,
      "a.b": false,
      e: false,
    },
    cb
  );
  const expectedRows = [
    {
      kind: "Root",
      id: "a",
      primaryCell: {
        label: "name",
        value: "a",
      },
    },
    {
      kind: "Leaf",
      id: "a$b",
      level: 1,
      primaryCell: {
        label: "name",
        value: "b",
      },
      valueCells: [
        {
          label: "type",
          value: "int?",
        },
        {
          label: "description",
          value: "desc",
        },
      ],
    },
    {
      kind: "Branch",
      id: "a$c",
      level: 1,
      primaryCell: {
        label: "name",
        value: "c",
      },
    },
    {
      kind: "Leaf",
      id: "a$c$d",
      level: 2,
      primaryCell: {
        label: "name",
        value: "d",
      },
      valueCells: [
        {
          label: "type",
          value: "int",
        },
        {
          label: "description",
          value: "desc",
        },
      ],
    },
    {
      kind: "Flat",
      id: "e",
      primaryCell: {
        label: "name",
        value: "e",
      },
      valueCells: [
        {
          label: "type",
          value: "string",
        },
        {
          label: "description",
          value: "",
        },
      ],
    },
    {
      kind: "Root",
      id: "f",
      primaryCell: {
        label: "name",
        value: "f",
      },
    },
    {
      kind: "Leaf",
      id: "f$g",
      level: 1,
      primaryCell: {
        label: "name",
        value: "g",
      },
      valueCells: [
        {
          label: "type",
          value: "dict?",
        },
        {
          label: "description",
          value: "sample",
        },
      ],
    },
  ];
  expect(rows).toMatchObject(expectedRows);
});
