import { ReactElement } from "react";
import { ActionPresenter } from "@/UI/Inventory/Presenters/ActionPresenter";

export class DummyActionPresenter implements ActionPresenter {
  getForId(): ReactElement | null {
    return null;
  }
}
