import type { GameThemeId, GameThemeOption } from "../../theme/themeCatalog/themeCatalog";
import { getPalettePreviewSwatches } from "../../theme/palettePreview/palettePreview";
import "./ThemeSelector.css";

type ThemeSelectorProps = {
  options: readonly GameThemeOption[];
  selectedId: GameThemeId;
  onSelect: (id: GameThemeId) => void;
};

export function ThemeSelector({
  options,
  selectedId,
  onSelect,
}: ThemeSelectorProps) {
  return (
    <fieldset className="theme-selector">
      <legend className="theme-selector-legend">Theme</legend>
      <div className="theme-selector-options">
        {options.map((option) => (
          <ThemeOptionRow
            key={option.id}
            option={option}
            selected={option.id === selectedId}
            onSelect={() => onSelect(option.id)}
          />
        ))}
      </div>
    </fieldset>
  );
}

function ThemeOptionRow({
  option,
  selected,
  onSelect,
}: {
  option: GameThemeOption;
  selected: boolean;
  onSelect: () => void;
}) {
  const swatches = getPalettePreviewSwatches(option.palette);

  return (
    <label
      className={`theme-selector-option${selected ? " is-selected" : ""}`}
    >
      <input
        type="radio"
        name="game-theme"
        value={option.id}
        checked={selected}
        onChange={onSelect}
        aria-label={buildThemeAriaLabel(option)}
      />
      <span className="theme-selector-label">{option.label}</span>
      <PalettePreviewSwatches colors={swatches} />
    </label>
  );
}

function PalettePreviewSwatches({ colors }: { colors: readonly string[] }) {
  return (
    <span className="theme-selector-swatches" aria-hidden="true">
      {colors.map((color, index) => (
        <span
          key={`${color}-${index}`}
          className="theme-selector-swatch"
          style={{ backgroundColor: color }}
        />
      ))}
    </span>
  );
}

function buildThemeAriaLabel(option: GameThemeOption): string {
  const { palette } = option;

  return `${option.label} theme: ${palette.background} background, ${palette.player} player, ${palette.platform} platform, ${palette.hazard} hazard, ${palette.accent} accent`;
}
