import { fromEntries } from "@/Core";

export interface ExpansionState {
  [id: string]: boolean;
}

export class TreeExpansionManager {
  constructor(private readonly separator: string) {}

  private createState(keys: string[], state = false): ExpansionState {
    const pairs = keys.map((id) => [id, state]);
    return fromEntries(pairs);
  }

  create(keys: string[], state = false): ExpansionState {
    return this.createState(keys, state);
  }

  toggle(state: ExpansionState, key: string): ExpansionState {
    if (state[key]) return this.close(state, key);
    return this.open(state, key);
  }

  toggleAll(
    state: ExpansionState,
    key: string,
    shouldOpen: boolean
  ): ExpansionState {
    if (shouldOpen) return this.openAll(state, key);
    return this.close(state, key);
  }

  get(state: ExpansionState, key: string): boolean {
    return state[key];
  }
  checkIfAllChildrenAreOpened(state: ExpansionState, key: string): boolean {
    const keysToCheck = Object.keys(state).filter((k) =>
      k.startsWith(`${key}${this.separator}`)
    );
    const stateValues = keysToCheck.map((key) => state[key]);
    return stateValues.every((value) => value === true);
  }
  getExpandableChildrenAmount(state: ExpansionState, key: string): number {
    const keysToCheck = Object.keys(state).filter((k) =>
      k.startsWith(`${key}${this.separator}`)
    );
    /**
     * Split keys to show how deep nested they are
     * Then return only children that are at level 3 or higher.
     * That mean there are more nesting levels than one, so expandAll is justified
     */
    return keysToCheck
      .map((key) => key.split(this.separator))
      .filter((splittedKey) => splittedKey.length > 2).length;
  }

  /**
   * Rows are not a nested structure, they are a flat list.
   * Closing a parent, does not visually hide the children.
   * Therefor we need to close all the children when a parent is closed.
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

  private openAll(state: ExpansionState, key: string): ExpansionState {
    const keysToOpen = Object.keys(state).filter((k) =>
      k.startsWith(`${key}${this.separator}`)
    );

    const openedState = this.createState([...keysToOpen, key], true);
    return {
      ...state,
      ...openedState,
    };
  }

  private open(state: ExpansionState, key: string): ExpansionState {
    this.checkIfAllChildrenAreOpened(state, key);
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
