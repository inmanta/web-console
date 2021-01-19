import { ReactElement } from "react";
import { ActionPresenter } from "@/UI/Inventory/Presenters";

export class DummyActionPresenter implements ActionPresenter {
  getForId(): ReactElement | null {
    return null;
  }
}
