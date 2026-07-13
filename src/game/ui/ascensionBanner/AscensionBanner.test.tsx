import { isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AscensionBanner } from "./AscensionBanner";

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

describe("AscensionBanner", () => {
  it("renders the ascension message", () => {
    const markup = renderToStaticMarkup(
      <AscensionBanner onDismiss={() => undefined} />,
    );

    expect(markup).toContain(
      "Congratulations. Having experienced everything that this climb has to offer, you have ascended.",
    );
    expect(markup).toContain('role="status"');
  });

  it("calls onDismiss from the Dismiss button", () => {
    const onDismiss = vi.fn();
    const dismissButton = findButtonWithText(
      AscensionBanner({ onDismiss }),
      "Dismiss",
    );

    expect(dismissButton).not.toBeNull();

    dismissButton?.props.onClick?.();

    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
