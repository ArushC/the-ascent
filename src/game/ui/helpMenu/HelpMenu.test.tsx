import { isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { HELP_SECTIONS } from "./helpContent/helpContent";
import { HelpMenu } from "./HelpMenu";

function findButtonWithText(
  node: ReactNode,
  text: string,
): ReactElement<{ children?: ReactNode; onClick?: () => void }> | null {
  if (!isValidElement<{ children?: ReactNode; onClick?: () => void }>(node)) {
    return null;
  }

  if (node.type === "button" && node.props.children === text) {
    return node;
  }

  const children = node.props.children;
  const childNodes = Array.isArray(children) ? children : [children];

  for (const childNode of childNodes) {
    const button = findButtonWithText(childNode, text);

    if (button) return button;
  }

  return null;
}

describe("HelpMenu", () => {
  it("renders help sections", () => {
    const markup = renderToStaticMarkup(<HelpMenu onClose={() => undefined} />);

    for (const section of HELP_SECTIONS) {
      expect(markup).toContain(section.title);
    }
  });

  it("calls onClose from the Close button", () => {
    const onClose = vi.fn();
    const closeButton = findButtonWithText(HelpMenu({ onClose }), "Close");

    expect(closeButton).not.toBeNull();

    closeButton?.props.onClick?.();

    expect(onClose).toHaveBeenCalledOnce();
  });
});
