import Next from "~/shared/ui/assets/player-icons/next-track.svg?react";
import Pause from "~/shared/ui/assets/player-icons/pause.svg?react";
import Play from "~/shared/ui/assets/player-icons/play.svg?react";
import Prev from "~/shared/ui/assets/player-icons/prev-track.svg?react";
import styles from "./web-playback.module.scss";

interface PlaybackControlsProps {
  isPaused: boolean;
  onPrevTrack: () => void;
  onPlayPause: () => void;
  onNextTrack: () => void;
}

export const PlaybackControls = ({
  isPaused,
  onPrevTrack,
  onPlayPause,
  onNextTrack,
}: PlaybackControlsProps) => (
  <div className={styles.controls}>
    <button
      type="button"
      className={styles.controlButton}
      onClick={onPrevTrack}
      aria-label="Previous track"
    >
      <Prev />
    </button>
    <button
      type="button"
      className={styles.playPauseButton}
      onClick={onPlayPause}
      aria-label="Play or pause"
    >
      {isPaused ? <Play /> : <Pause />}
    </button>
    <button
      type="button"
      className={styles.controlButton}
      onClick={onNextTrack}
      aria-label="Next track"
    >
      <Next />
    </button>
  </div>
); 