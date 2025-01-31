import clsx from "clsx";
import { memo } from "react";
import Heart from "~/shared/ui/assets/player-icons/heart.svg?react";
import VolumeOff from "~/shared/ui/assets/player-icons/volume-off.svg?react";
import Volume from "~/shared/ui/assets/player-icons/volume.svg?react";
import styles from "./web-playback.module.scss";

interface AdditionalControlsProps {
  volume: number;
  isMuted: boolean;
  isFavorite: boolean;
  onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onVolumeToggle: () => void;
  onFavoriteToggle: () => void;
}

export const AdditionalControls = memo(({
  volume,
  isMuted,
  isFavorite,
  onVolumeChange,
  onVolumeToggle,
  onFavoriteToggle,
}: AdditionalControlsProps) => (
  <div className={styles.rightSection}>
    <button
      type="button"
      className={clsx(styles.favoriteButton, { [styles.active]: isFavorite })}
      onClick={onFavoriteToggle}
      aria-label="Add to favorites"
    >
      <Heart />
    </button>
    <div className={styles.volumeContainer}>
      <button
        type="button"
        className={styles.volumeButton}
        onClick={onVolumeToggle}
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <VolumeOff /> : <Volume />}
      </button>
      <input
        type="range"
        min="0"
        max="100"
        value={volume}
        className={styles.volume}
        style={{ "--value": volume } as React.CSSProperties}
        onChange={onVolumeChange}
      />
    </div>
  </div>
));