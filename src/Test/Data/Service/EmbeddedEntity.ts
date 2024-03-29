import { EmbeddedEntity } from "@/Core";
import { attributesList } from "./Attribute";

export const a: EmbeddedEntity = {
  attributes: [
    {
      name: "service_id",
      description:
        "a 9- or 7-digit number that uniquely identifies the service instance. Also referred to as codif.",
      modifier: "rw",
      type: "int",
      default_value: null,
      default_value_set: false,
      validation_type: "pydantic.conint",
      validation_parameters: { ge: 1000000, le: 9999999999 },
    },
  ],
  embedded_entities: [
    {
      attributes: [
        {
          name: "vc_id",
          description:
            "The circuit id used in the network. This id needs to be unique network wide. This vc_id is requested from\nSirius. This parameter is an integer in the 1..2147483647 range.",
          modifier: "rw",
          type: "number?",
          default_value: null,
          default_value_set: false,
          validation_type: null,
          validation_parameters: null,
        },
      ],
      embedded_entities: [],
      name: "allocated",
      description: "Circuit allocated attributes",
      modifier: "r",
      lower_limit: 1,
      upper_limit: 1,
    },
    {
      attributes: [
        {
          name: "ipx_access",
          description:
            "IPX access id, this value is to identify the port. The format of this key is the same as the Circuit.service_id (codif).",
          modifier: "rw",
          type: "int",
          default_value: null,
          default_value_set: false,
          validation_type: "pydantic.conint",
          validation_parameters: { ge: 1000000, le: 9999999999 },
        },
        {
          name: "outer_vlan",
          description:
            "The outer VLAN that is used at the IPX access for this service.",
          modifier: "rw",
          type: "int",
          default_value: null,
          default_value_set: false,
          validation_type: "pydantic.conint",
          validation_parameters: { ge: 0, lt: 4096 },
        },
        {
          name: "inner_vlan",
          description:
            "The inner VLAN that is used at the IPX access for this service. This parameter is\nonly valid and mandatory if the encapsulation type is QinQ.",
          modifier: "rw",
          type: "int?",
          default_value: null,
          default_value_set: true,
          validation_type: "pydantic.conint?",
          validation_parameters: { ge: 0, lt: 4096 },
        },
        {
          name: "encapsulation",
          description:
            "The encapsulation type. Valid values are dot1Q and QinQ. When QinQ is specified,\na valid value for outer_vlan and inner_vlan is mandatory. For dot1 only outer_vlan is expected.",
          modifier: "rw",
          type: "string",
          default_value: null,
          default_value_set: false,
          validation_type: "pydantic.constr",
          validation_parameters: {
            regex: "^(qinq|dot1q|)$",
            strict: true,
          },
        },
      ],
      embedded_entities: [
        {
          attributes: [
            {
              name: "router_name",
              description: "The name of the router.",
              modifier: "rw",
              type: "string?",
              default_value: null,
              default_value_set: false,
              validation_type: null,
              validation_parameters: null,
            },
            {
              name: "router_system_ip",
              description: "The system ip of the router.",
              modifier: "rw",
              type: "string?",
              default_value: null,
              default_value_set: false,
              validation_type: "ipaddress.IPv4Address?",
              validation_parameters: null,
            },
            {
              name: "router_mgmt_ip",
              description:
                "The managment IP of the router at the customer side of the service for netconf.",
              modifier: "rw",
              type: "string?",
              default_value: null,
              default_value_set: false,
              validation_type: "ipaddress.IPv4Address?",
              validation_parameters: null,
            },
            {
              name: "router_vendor",
              description:
                "The vendor of the router. This is required to determine the correct parameters in the MPLS domain.",
              modifier: "rw",
              type: "string?",
              default_value: null,
              default_value_set: false,
              validation_type: "pydantic.constr?",
              validation_parameters: {
                regex: "^(Nokia|Alcatel-Lucent|)$",
                strict: true,
              },
            },
            {
              name: "router_chassis",
              description:
                "The chassis type of the router. This is also required to correctly\ndetermine the parameters in the MPLS domain.",
              modifier: "rw",
              type: "string?",
              default_value: null,
              default_value_set: false,
              validation_type: null,
              validation_parameters: null,
            },
            {
              name: "router_port",
              description: "The port on the router",
              modifier: "rw",
              type: "string?",
              default_value: null,
              default_value_set: false,
              validation_type: null,
              validation_parameters: null,
            },
            {
              name: "tunnel_side",
              description: "The side of the tunnel (A or B)",
              modifier: "rw",
              type: "string?",
              default_value: null,
              default_value_set: false,
              validation_type: "pydantic.constr?",
              validation_parameters: {
                regex: "^(A|B|)$",
                strict: true,
              },
            },
          ],
          embedded_entities: [],
          name: "allocated",
          description: "Allocated attributes for customer endpoint ",
          modifier: "r",
          lower_limit: 1,
          upper_limit: 1,
        },
      ],
      name: "customer_endpoint",
      description:
        "Attributes for customer endpoint which are provided through the NB API",
      modifier: "rw",
      lower_limit: 1,
      upper_limit: 1,
    },
    {
      attributes: [
        {
          name: "ipx_access",
          description:
            "A list of NNI that provide connectivity to the CSP/Region provided in cloud_service_provider\nand csp_region. The list needs to contain at least one element. The values in the list have\nthe same type as service_id (codif).",
          modifier: "rw",
          type: "int[]",
          default_value: null,
          default_value_set: false,
          validation_type: "pydantic.conint[]",
          validation_parameters: { ge: 1000000, le: 9999999999 },
        },
        {
          name: "cloud_service_provider",
          description:
            "The CSP to connect to. Valid values are: Google, AWS, Azure_ECX, null.",
          modifier: "rw",
          type: "string",
          default_value: null,
          default_value_set: false,
          validation_type: "pydantic.constr",
          validation_parameters: {
            regex: "^(AWS|Azure_ECX|Google|null)$",
            strict: true,
          },
        },
        {
          name: "region",
          description: "The CSP region to connect to.",
          modifier: "rw",
          type: "string",
          default_value: null,
          default_value_set: false,
          validation_type: "pydantic.constr",
          validation_parameters: {
            regex: "^[a-zA-Z0-9\\-_]*$",
            strict: true,
          },
        },
        {
          name: "attributes",
          description:
            "A dictionary with attributes specific for the selected CSP. For example, aws also requires\nthe aws account id. The validation of these attributes depends on the selected CSP. The current\nversion requires the dict to have alphanumeric with _ keys and string values that are printable\nascii chars. The values might be further constrained by each of the CSP implementations.",
          modifier: "rw",
          type: "dict",
          default_value: null,
          default_value_set: false,
          validation_type: null,
          validation_parameters: null,
        },
      ],
      embedded_entities: [
        {
          attributes: [
            {
              name: "encapsulation",
              description:
                "The encapsulation type. Valid values are dot1Q and QinQ. When QinQ is specified,\na valid value for outer_vlan and inner_vlan is mandatory. For dot1 only outer_vlan is expected.",
              modifier: "rw",
              type: "string?",
              default_value: null,
              default_value_set: false,
              validation_type: "pydantic.constr?",
              validation_parameters: {
                regex: "^(qinq|dot1q|)$",
                strict: true,
              },
            },
            {
              name: "ipx_access",
              description: "Allocated IPX access value from ipx_access list",
              modifier: "rw",
              type: "int?",
              default_value: null,
              default_value_set: false,
              validation_type: "pydantic.conint?",
              validation_parameters: { ge: 1000000, le: 9999999999 },
            },
            {
              name: "attributes",
              description: "Dictionary for common allocated attributes for CSP",
              modifier: "rw",
              type: "dict?",
              default_value: null,
              default_value_set: false,
              validation_type: null,
              validation_parameters: null,
            },
            {
              name: "outer_vlan",
              description:
                "The outer VLAN that is used at the IPX access for this service.",
              modifier: "rw",
              type: "int?",
              default_value: null,
              default_value_set: false,
              validation_type: "pydantic.conint?",
              validation_parameters: { ge: 0, lt: 4096 },
            },
            {
              name: "inner_vlan",
              description:
                "The inner VLAN that is used at the IPX access for this service. This parameter is\nonly valid and mandatory if the encapsulation type is QinQ.",
              modifier: "rw",
              type: "int?",
              default_value: null,
              default_value_set: false,
              validation_type: "pydantic.conint?",
              validation_parameters: { ge: 0, lt: 4096 },
            },
            {
              name: "router_name",
              description: "The name of the router.",
              modifier: "rw",
              type: "string?",
              default_value: null,
              default_value_set: false,
              validation_type: null,
              validation_parameters: null,
            },
            {
              name: "router_system_ip",
              description: "The system ip of the router.",
              modifier: "rw",
              type: "string?",
              default_value: null,
              default_value_set: false,
              validation_type: "ipaddress.IPv4Address?",
              validation_parameters: null,
            },
            {
              name: "router_mgmt_ip",
              description:
                "The managment IP of the router at the customer side of the service for netconf.",
              modifier: "rw",
              type: "string?",
              default_value: null,
              default_value_set: false,
              validation_type: "ipaddress.IPv4Address?",
              validation_parameters: null,
            },
            {
              name: "router_vendor",
              description:
                "The vendor of the router. This is required to determine the correct parameters in the MPLS domain.",
              modifier: "rw",
              type: "string?",
              default_value: null,
              default_value_set: false,
              validation_type: "pydantic.constr?",
              validation_parameters: {
                regex: "^(Nokia|Alcatel-Lucent|)$",
                strict: true,
              },
            },
            {
              name: "router_chassis",
              description:
                "The chassis type of the router. This is also required to correctly\ndetermine the parameters in the MPLS domain.",
              modifier: "rw",
              type: "string?",
              default_value: null,
              default_value_set: false,
              validation_type: null,
              validation_parameters: null,
            },
            {
              name: "router_port",
              description: "The port on the router",
              modifier: "rw",
              type: "string?",
              default_value: null,
              default_value_set: false,
              validation_type: null,
              validation_parameters: null,
            },
            {
              name: "tunnel_side",
              description: "The side of the tunnel (A or B)",
              modifier: "rw",
              type: "string?",
              default_value: null,
              default_value_set: false,
              validation_type: "pydantic.constr?",
              validation_parameters: {
                regex: "^(A|B|)$",
                strict: true,
              },
            },
          ],
          embedded_entities: [],
          name: "allocated",
          description: "Allocated attributes for CSP endpoint",
          modifier: "r",
          lower_limit: 1,
          upper_limit: 1,
        },
      ],
      name: "csp_endpoint",
      description:
        "Attributes for CSP endpoint which are provided through the NB API",
      modifier: "rw",
      lower_limit: 1,
      upper_limit: 1,
    },
  ],
  name: "circuits",
  description: "Circuit attributes ",
  modifier: "rw+",
  lower_limit: 1,
  upper_limit: 4,
};

export const list = [a];

export const nestedEditable: EmbeddedEntity[] = [
  {
    attributes: [
      {
        name: "my_attr",
        modifier: "rw+",
        type: "int",
        default_value: null,
        default_value_set: false,
        validation_type: null,
        validation_parameters: null,
      },
      {
        name: "bool_attr",
        modifier: "rw+",
        type: "bool?",
        default_value: null,
        default_value_set: false,
        validation_type: null,
        validation_parameters: null,
      },
      {
        name: "dict_attr",
        modifier: "rw+",
        type: "dict",
        default_value: null,
        default_value_set: false,
        validation_type: null,
        validation_parameters: null,
      },
    ],
    embedded_entities: [
      {
        attributes: [
          {
            name: "attr4",
            modifier: "rw",
            type: "int[]",
            default_value: null,
            default_value_set: false,
            validation_type: null,
            validation_parameters: null,
          },
        ],
        embedded_entities: [],
        name: "embedded_single",
        description: "description",
        modifier: "rw",
        lower_limit: 0,
        upper_limit: 1,
      },
    ],
    name: "embedded",
    description: "description",
    modifier: "rw+",
    lower_limit: 0,
    upper_limit: 2,
  },
  {
    attributes: [
      {
        name: "my_other_attr",
        modifier: "rw+",
        type: "string",
        default_value: null,
        default_value_set: false,
        validation_type: null,
        validation_parameters: null,
      },
    ],
    embedded_entities: [
      {
        attributes: [
          {
            name: "attr5",
            modifier: "rw+",
            type: "number",
            default_value: null,
            default_value_set: false,
            validation_type: null,
            validation_parameters: null,
          },
          {
            name: "attr6",
            modifier: "rw+",
            type: "number",
            default_value: null,
            default_value_set: false,
            validation_type: null,
            validation_parameters: null,
          },
        ],
        embedded_entities: [],
        name: "another_embedded_single",
        description: "description",
        modifier: "rw+",
        lower_limit: 0,
        upper_limit: 1,
        inter_service_relations: [
          {
            name: "related_service",
            entity_type: "test_entity",
            description: "description",
            lower_limit: 0,
            modifier: "rw",
          },
        ],
      },
    ],
    name: "another_embedded",
    modifier: "rw+",
    lower_limit: 0,
    description: "description",
  },
  {
    attributes: [
      {
        name: "not_editable_attr",
        modifier: "rw",
        type: "int",
        default_value: null,
        default_value_set: false,
        validation_type: null,
        validation_parameters: null,
      },
    ],
    embedded_entities: [],
    name: "not_editable",
    modifier: "rw",
    lower_limit: 1,
    upper_limit: 1,
  },
  {
    attributes: [
      {
        name: "should_fill_in_on_create",
        modifier: "rw",
        type: "int",
        default_value: null,
        default_value_set: false,
        validation_type: null,
        validation_parameters: null,
      },
    ],
    embedded_entities: [],
    name: "editable_embedded_entity_relation_with_rw_attributes",
    modifier: "rw+",
    lower_limit: 1,
    upper_limit: 4,
  },
];

export const multiNestedEditable: EmbeddedEntity[] = [
  {
    attributes: [
      {
        name: "my_attr",
        modifier: "rw+",
        type: "int",
        default_value: null,
        default_value_set: false,
        validation_type: null,
        validation_parameters: null,
      },
      {
        name: "bool_attr",
        modifier: "rw+",
        type: "bool?",
        default_value: null,
        default_value_set: false,
        validation_type: null,
        validation_parameters: null,
      },
      {
        name: "dict_attr",
        modifier: "rw+",
        type: "dict",
        default_value: null,
        default_value_set: false,
        validation_type: null,
        validation_parameters: null,
      },
    ],
    embedded_entities: [
      {
        attributes: [
          {
            name: "attr4",
            modifier: "rw+",
            type: "int[]",
            default_value: null,
            default_value_set: false,
            validation_type: null,
            validation_parameters: null,
          },
        ],
        embedded_entities: [
          {
            attributes: [
              {
                name: "my_other_attr",
                modifier: "rw+",
                type: "string",
                default_value: null,
                default_value_set: false,
                validation_type: null,
                validation_parameters: null,
              },
            ],
            embedded_entities: [
              {
                attributes: [
                  {
                    name: "attr5",
                    modifier: "rw+",
                    type: "number",
                    default_value: null,
                    default_value_set: false,
                    validation_type: null,
                    validation_parameters: null,
                  },
                  {
                    name: "attr6",
                    modifier: "rw+",
                    type: "number",
                    default_value: null,
                    default_value_set: false,
                    validation_type: null,
                    validation_parameters: null,
                  },
                ],
                embedded_entities: [],
                name: "another_embedded_single",
                description: "description",
                modifier: "rw+",
                lower_limit: 0,
                upper_limit: 1,
                inter_service_relations: [
                  {
                    name: "related_service",
                    entity_type: "test_entity",
                    description: "description",
                    lower_limit: 0,
                    modifier: "rw",
                  },
                ],
              },
            ],
            name: "another_embedded",
            modifier: "rw+",
            lower_limit: 0,
            description: "description",
          },
        ],
        name: "embedded_single",
        description: "description",
        modifier: "rw+",
        lower_limit: 0,
        upper_limit: 1,
      },
    ],
    name: "embedded",
    description: "description",
    modifier: "rw+",
    lower_limit: 0,
    upper_limit: 2,
  },
];

export const embedded: EmbeddedEntity = {
  attributes: attributesList,
  embedded_entities: [],
  name: "embedded",
  description: "desc",
  modifier: "rw",
  lower_limit: 1,
  upper_limit: 4,
};
export const embedded_base: EmbeddedEntity = {
  attributes: attributesList,
  embedded_entities: [
    embedded,
    {
      ...embedded,
      name: "editableEmbedded",
      modifier: "rw+",
    },
    {
      ...embedded,
      name: "embedded?",
      lower_limit: 0,
    },
    {
      ...embedded,
      name: "editableEmbedded?",
      modifier: "rw+",
      lower_limit: 0,
    },
  ],
  name: "embedded_base",
  description: "desc",
  modifier: "rw",
  lower_limit: 1,
  upper_limit: 4,
};

export const editableEmbedded_base: EmbeddedEntity = {
  ...embedded_base,
  name: "editableEmbedded_base",
  modifier: "rw+",
};
export const optionalEmbedded_base: EmbeddedEntity = {
  ...embedded_base,
  name: "optionalEmbedded_base",
  lower_limit: 0,
};
export const editableOptionalEmbedded_base: EmbeddedEntity = {
  ...optionalEmbedded_base,
  name: "editableOptionalEmbedded_base",
  modifier: "rw+",
};
