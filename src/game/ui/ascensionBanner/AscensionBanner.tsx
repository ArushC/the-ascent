import "./AscensionBanner.css";

type AscensionBannerProps = {
  onDismiss: () => void;
};

export function AscensionBanner({ onDismiss }: AscensionBannerProps) {
  return (
    <div className="game-ascension-banner" role="status">
      <p>
        Congratulations. Having experienced everything that this climb has to
        offer, you have ascended.
      </p>
      <button className="game-btn" type="button" onClick={onDismiss}>
        Dismiss
      </button>
    </div>
  );
}
