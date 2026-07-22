import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ThemeSelector } from "./ThemeSelector";
import { THEME_OPTIONS } from "../../theme/themeCatalog/themeCatalog";

describe("ThemeSelector", () => {
  it("renders a preview swatch row for every theme option", () => {
    const markup = renderToStaticMarkup(
      <ThemeSelector
        options={THEME_OPTIONS}
        selectedId="classic"
        onSelect={vi.fn()}
      />,
    );

    expect(markup).toContain("Classic");
    expect(markup).toContain("Neon");
    expect(markup).toContain("Ocean");
    expect(markup.match(/class="theme-selector-swatch"/g)?.length).toBe(15);
  });

  it("marks the selected option as checked", () => {
    const markup = renderToStaticMarkup(
      <ThemeSelector
        options={THEME_OPTIONS}
        selectedId="neon"
        onSelect={vi.fn()}
      />,
    );

    expect(markup).toContain('value="neon"');
    expect(markup).toContain('checked=""');
    expect(markup).not.toContain('value="classic" checked=""');
    expect(markup).toContain("is-selected");
  });

  it("includes descriptive aria labels for each theme option", () => {
    const markup = renderToStaticMarkup(
      <ThemeSelector
        options={THEME_OPTIONS}
        selectedId="classic"
        onSelect={vi.fn()}
      />,
    );

    expect(markup).toContain('aria-label="Classic theme: black background');
    expect(markup).toContain('aria-hidden="true"');
  });
});
