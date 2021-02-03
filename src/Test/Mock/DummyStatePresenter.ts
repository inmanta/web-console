import { ReactElement } from "react";
import { StatePresenter } from "@/UI/Inventory/Presenters";

export class DummyStatePresenter implements StatePresenter {
  getForId(): ReactElement | null {
    return null;
  }
}
