import { expect, it } from "vitest";
import { renderTemplate } from "./promptRender.ts";
it("renders known params and removes missing params", () => { expect(renderTemplate("{{FEATURE}} / {{MISSING}}", { FEATURE: "Bounce" })).toBe("Bounce / "); });
