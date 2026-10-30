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
      const locale = readLocale();
      return (
        <main className="crash-screen">
          <div className="crash-card" role="alert">
            <span className="crash-mark" aria-hidden="true">{content.meta.monogram}</span>
            <p className="crash-text">{text(content.ui.crash, locale)}</p>
            <button type="button" className="btn btn-gold crash-reload" onClick={() => window.location.reload()}>
              {text(content.ui.crashReload, locale)}
            </button>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}
