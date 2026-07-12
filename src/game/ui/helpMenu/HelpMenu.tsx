import { HELP_SECTIONS } from "./helpContent/helpContent";
import "./HelpMenu.css";

type HelpMenuProps = {
  onClose: () => void;
};

export function HelpMenu({ onClose }: HelpMenuProps) {
  return (
    <div className="game-menu-backdrop">
      <div
        className="game-menu game-help-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Help"
      >
        <h1>Help</h1>
        <div className="game-help-content">
          {HELP_SECTIONS.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              {section.lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </section>
          ))}
        </div>
        <div className="game-menu-actions">
          <button className="game-btn" type="button" onClick={onClose}>
            Close
          </button>
        </div>
        <p className="game-help-hint">Press H to toggle</p>
      </div>
    </div>
  );
}
