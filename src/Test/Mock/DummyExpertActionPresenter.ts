import { ReactElement } from "react";
import { ActionPresenter } from "@/UI/Presenters";

export class DummyExpertActionPresenter implements ActionPresenter {
  getAvailableStates(): string[] {
    return [];
  }
  getForId(): ReactElement | null {
    return null;
  }
}
