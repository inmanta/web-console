import { ReactElement } from "react";
import { ActionPresenter } from "@/UI/Presenters";

export class DummyExpertActionPresenter implements ActionPresenter {
  getAvailableStates(): string[] {
    throw new Error("Method not implemented.");
  }
  getForId(): ReactElement | null {
    return null;
  }
}
