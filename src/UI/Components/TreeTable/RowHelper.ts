import { Attributes } from "@/Core";

type Descriptor<Value = unknown> =
  | { done: false }
  | { done: true; value: Value };

type SingleDescriptor = Descriptor<unknown>;

type SingleAttributeDict = Record<string, SingleDescriptor>;

type MultiDescriptor = Descriptor<{
  candidate: unknown;
  active: unknown;
  rollback: unknown;
}>;

type MultiAttributeDict = Record<string, MultiDescriptor>;

export class RowHelper {
  constructor(private readonly separator: string) {}

  getPaths(attributes: Attributes): string[] {
    return Object.keys(
      this.getSingleAttributeDict("", {
        ...attributes.candidate,
        ...attributes.active,
        ...attributes.rollback,
      })
    );
  }

  getMultiAttributeDict(attributes: Attributes): MultiAttributeDict {
    const candidateDescriptors = this.getSingleAttributeDict(
      "",
      attributes.candidate
    );
    const activeDescriptors = this.getSingleAttributeDict(
      "",
      attributes.active
    );
    const rollbackDescriptors = this.getSingleAttributeDict(
      "",
      attributes.rollback
    );

    return mergeDescriptors(
      candidateDescriptors,
      activeDescriptors,
      rollbackDescriptors
    );
  }

  private getSingleAttributeDict(
    prefix: string,
    subject: unknown
  ): SingleAttributeDict {
    if (!this.isNested(subject)) return {};
    let keys = {};
    const primaryKeys = Object.keys(subject);
    primaryKeys.forEach((key) => {
      if (!this.isNested(subject[key])) {
        keys[`${prefix}${key}`] = { done: true, value: subject[key] };
      } else {
        keys[`${prefix}${key}`] = { done: false };
        keys = {
          ...keys,
          ...this.getSingleAttributeDict(
            `${prefix}${key}${this.separator}`,
            subject[key]
          ),
        };
      }
    });
    return keys;
  }

  private isNested(value: unknown): value is Record<string, unknown> {
    return (
      typeof value === "object" &&
      value !== null &&
      Object.keys(value).length > 0 &&
      (!Array.isArray(value) || value.some((v) => this.isNested(v)))
    );
  }
}

export function mergeDescriptors(
  cds: Record<string, Descriptor>,
  ads: Record<string, Descriptor>,
  rds: Record<string, Descriptor>
): MultiAttributeDict {
  const allKeys = Object.keys({
    ...cds,
    ...ads,
    ...rds,
  });

  return allKeys.reduce((acc, cur) => {
    const done = getDone(cds[cur], ads[cur], rds[cur]);
    if (done) {
      acc[cur] = {
        done,
        value: {
          candidate: getValue(cds[cur]),
          active: getValue(ads[cur]),
          rollback: getValue(rds[cur]),
        },
      };
    } else {
      acc[cur] = { done };
    }

    return acc;
  }, {});
}

function getDone(
  cd: Descriptor | undefined,
  ad: Descriptor | undefined,
  rd: Descriptor | undefined
): boolean {
  return isDone(cd) && isDone(ad) && isDone(rd);
}

function getValue(descriptor: Descriptor | undefined): unknown {
  if (typeof descriptor === "undefined") return undefined;
  if (!descriptor.done) return undefined;
  return descriptor.value;
}

function isDone(descriptor: Descriptor | undefined): boolean {
  if (typeof descriptor === "undefined") return true;
  return descriptor.done;
}
