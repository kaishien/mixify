import { memo } from "react";
import { formatTime } from "./lib/format-time";
import styles from "./web-playback.module.scss";

interface ProgressBarProps {
  progress: number;
  duration: number;
  onProgressChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  progressBarRef: React.RefObject<HTMLInputElement>;
}

export const ProgressBar = memo(({
  progress,
  duration,
  onProgressChange,
  progressBarRef,
}: ProgressBarProps) => (
  <div className={styles.progressContainer}>
    <input
      ref={progressBarRef}
      type="range"
      min="0"
      max={duration}
      value={progress}
      className={styles.progress}
      onChange={onProgressChange}
    />
    <div className={styles.timeContainer}>
      <span className={styles.time}>{formatTime(progress)}</span>
      <span className={styles.time}>{formatTime(duration)}</span>
    </div>
  </div>
));