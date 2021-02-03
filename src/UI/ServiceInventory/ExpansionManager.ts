import { fromEntries } from "@/Core";

export interface ExpansionState {
  [id: string]: boolean;
}

export class ExpansionManager {
  private createState(keys: string[]): ExpansionState {
    const pairs = keys.map((id) => [id, false]);
    return fromEntries(pairs);
  }

  create(keys: string[]): ExpansionState {
    return this.createState(keys);
  }

  toggle(state: ExpansionState, id: string): ExpansionState {
    return {
      ...state,
      [id]: !state[id],
    };
  }

  merge(state: ExpansionState, keys: string[]): ExpansionState {
    const entries = keys.map((key) => {
      if (typeof state[key] === "undefined") return [key, false];
      return [key, state[key]];
    });

    return fromEntries(entries);
  }
}
