import { Reference } from "@/Core/Domain";

/**
 * Real payloads from a demo environment, used across the reference engine and
 * component tests. `compliance*` is a `future::lsm::ServiceAttributeValue` whose
 * whole `value` is replaced: one `core::Replace` mutator in front of seven
 * reference nodes three levels deep, with an `mjson` argument keyed `$[0..2]`.
 * `environment*` is the common case: a secret in one nested attribute filled by
 * a single `std::Environment`. The `template` literal is trimmed for readability;
 * it still classifies as multiline `Code`.
 */

export const complianceMutators: Reference.RawMutator[] = [
  {
    type: "core::Replace",
    args: [
      {
        name: "resource",
        type: "resource",
        id: "future::lsm::ServiceAttributeValue[lsm,uri=3ef00f70-ef21-3821-969f-1c3193f69fd4:compliance]",
      },
      { name: "value", type: "reference", id: "b5d776d4-f3c4-358e-a102-2d1b2fc28a18" },
      { name: "destination", type: "literal", value: "value" },
    ],
  },
];

export const complianceReferences: Reference.RawReference[] = [
  {
    id: "b5d776d4-f3c4-358e-a102-2d1b2fc28a18",
    type: "future::std::ComplianceReport",
    args: [
      {
        name: "resources_compliance_info",
        type: "mjson",
        value: [null, null, null],
        references: {
          "$[0]": { id: "39a2aaf5-70df-3363-b7a0-1f09bc3a313a", name: "$[0]", type: "reference" },
          "$[1]": { id: "0bca1fb2-d88a-335e-a834-17324dde83bf", name: "$[1]", type: "reference" },
          "$[2]": { id: "0432e70b-cb53-36e5-aa07-d3292b726249", name: "$[2]", type: "reference" },
        },
      },
      { name: "environment", type: "literal", value: "1c337bad-1701-49c9-90fe-028d88deb7ee" },
      {
        name: "template",
        type: "literal",
        value:
          '# Compliance report\n\nThe compliance report below summarizes the compliance of a part of the current desired state.\n\n{{ dict(name="", value="**Value**") | md_table(stats_table) }}\n',
      },
    ],
  },
  {
    id: "39a2aaf5-70df-3363-b7a0-1f09bc3a313a",
    type: "future::std::CompliantResourceCompliance",
    args: [
      { name: "compliance_status", type: "reference", id: "01297085-f2d8-3097-9ba0-4b4c418bf180" },
    ],
  },
  {
    id: "01297085-f2d8-3097-9ba0-4b4c418bf180",
    type: "future::std::ResourceComplianceStatus",
    args: [
      {
        name: "compliance_resource",
        type: "literal",
        value: "future::std::ResourceCompliance[std,name=3ef00f70-ef21-3821-969f-1c3193f69fd4]",
      },
      {
        name: "resource_id",
        type: "literal",
        value:
          "future::lsm::ServiceAttributeValue[lsm,uri=3ef00f70-ef21-3821-969f-1c3193f69fd4:documentation]",
      },
      { name: "environment", type: "literal", value: "1c337bad-1701-49c9-90fe-028d88deb7ee" },
    ],
  },
  {
    id: "0bca1fb2-d88a-335e-a834-17324dde83bf",
    type: "future::std::CompliantResourceCompliance",
    args: [
      { name: "compliance_status", type: "reference", id: "79b1c346-09cd-33cb-afe3-344cec8a4192" },
    ],
  },
  {
    id: "79b1c346-09cd-33cb-afe3-344cec8a4192",
    type: "future::std::ResourceComplianceStatus",
    args: [
      {
        name: "compliance_resource",
        type: "literal",
        value: "future::std::ResourceCompliance[std,name=3ef00f70-ef21-3821-969f-1c3193f69fd4]",
      },
      {
        name: "resource_id",
        type: "literal",
        value: "netbox::resources::Interface[http://172.25.162.59:8080,uri=cpe-1:ethernet-1/2]",
      },
      { name: "environment", type: "literal", value: "1c337bad-1701-49c9-90fe-028d88deb7ee" },
    ],
  },
  {
    id: "0432e70b-cb53-36e5-aa07-d3292b726249",
    type: "future::std::CompliantResourceCompliance",
    args: [
      { name: "compliance_status", type: "reference", id: "8e713d57-5c6c-33a7-9732-fd40c32324fc" },
    ],
  },
  {
    id: "8e713d57-5c6c-33a7-9732-fd40c32324fc",
    type: "future::std::ResourceComplianceStatus",
    args: [
      {
        name: "compliance_resource",
        type: "literal",
        value: "future::std::ResourceCompliance[std,name=3ef00f70-ef21-3821-969f-1c3193f69fd4]",
      },
      {
        name: "resource_id",
        type: "literal",
        value: "fs::JsonFile[telegraf,uri=/config/port-info-service-tags.json:cpe-1:ethernet-1/2]",
      },
      { name: "environment", type: "literal", value: "1c337bad-1701-49c9-90fe-028d88deb7ee" },
    ],
  },
];

export const complianceAttributes: Record<string, unknown> = {
  value: null,
  mutators: complianceMutators,
  references: complianceReferences,
};

export const environmentReferences: Reference.RawReference[] = [
  {
    id: "342e665e-1ff9-3037-adf1-9c1cbc154fed",
    type: "std::Environment",
    args: [{ name: "name", type: "literal", value: "CLOUDSMITH_API_KEY" }],
  },
];

export const environmentMutators: Reference.RawMutator[] = [
  {
    type: "core::Replace",
    args: [
      {
        name: "resource",
        type: "resource",
        id: "cloudsmith::resources::Entitlement[cloudsmith.io,uri=inmanta/proximus-iso9/proximus.be]",
      },
      { name: "value", type: "reference", id: "342e665e-1ff9-3037-adf1-9c1cbc154fed" },
      { name: "destination", type: "literal", value: "api.'api_token'" },
    ],
  },
];
