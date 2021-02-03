import { ReactElement } from "react";
import { ActionPresenter } from "@/UI/ServiceInventory/Presenters";

export class DummyActionPresenter implements ActionPresenter {
  getForId(): ReactElement | null {
    return null;
  }
}
