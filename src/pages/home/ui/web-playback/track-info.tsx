import { memo } from "react";
import styles from "./web-playback.module.scss";

interface TrackInfoProps {
  track: Spotify.Track;
}

export const TrackInfo = memo(({ track }: TrackInfoProps) => (
  <div className={styles.leftSection}>
    <img
      className={styles.cover}
      src={track.album.images[0]?.url}
      alt={track.name}
    />
    <div className={styles.info}>
      <div className={styles.trackName}>{track.name}</div>
      <div className={styles.artistName}>{track.artists[0].name}</div>
    </div>
  </div>
));