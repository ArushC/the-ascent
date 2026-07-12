import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PlayerNamePrompt } from "./PlayerNamePrompt";

describe("PlayerNamePrompt", () => {
  it("starts invalid until a player name is entered", () => {
    const markup = renderToStaticMarkup(
      <PlayerNamePrompt onSubmit={() => undefined} />,
    );

    expect(markup).toContain("Enter a player name.");
    expect(markup).toContain("disabled");
  });
});
