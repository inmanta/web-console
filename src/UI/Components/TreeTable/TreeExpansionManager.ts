import { fromEntries } from "@/Core";

export interface ExpansionState {
  [id: string]: boolean;
}

export class TreeExpansionManager {
  constructor(private readonly separator: string) {}

  private createState(keys: string[]): ExpansionState {
    const pairs = keys.map((id) => [id, false]);
    return fromEntries(pairs);
  }

  create(keys: string[]): ExpansionState {
    return this.createState(keys);
  }

  toggle(state: ExpansionState, key: string): ExpansionState {
    if (state[key]) return this.close(state, key);
    return this.open(state, key);
  }

  get(state: ExpansionState, key: string): boolean {
    return state[key];
  }

  /**
   * We need close all the children when a parent is closed
   */
  private close(state: ExpansionState, key: string): ExpansionState {
    const keysToClose = Object.keys(state).filter((k) =>
      k.startsWith(`${key}${this.separator}`)
    );

    const closedState = this.createState([...keysToClose, key]);
    return {
      ...state,
      ...closedState,
    };
  }

  private open(state: ExpansionState, key: string): ExpansionState {
    return {
      ...state,
      [key]: true,
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
