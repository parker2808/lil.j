import { Component, type ReactNode } from "react";
import { content } from "../content.ts";
import { readLocale, text } from "../lib/i18n.ts";

type BoundaryProps = {
  children: ReactNode;
};

type BoundaryState = {
  failed: boolean;
};

export class Boundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false };

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <main className="scene">
          <p>{text(content.ui.crash, readLocale())}</p>
        </main>
      );
    }
    return this.props.children;
  }
}
