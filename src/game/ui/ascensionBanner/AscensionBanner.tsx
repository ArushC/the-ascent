import "./AscensionBanner.css";

type AscensionBannerProps = {
  onDismiss: () => void;
};

export function AscensionBanner({ onDismiss }: AscensionBannerProps) {
  return (
    <div className="game-ascension-banner" role="status">
      <p>Congratulations! You have ascended.</p>
      <button className="game-btn" type="button" onClick={onDismiss}>
        Dismiss
      </button>
    </div>
  );
}
