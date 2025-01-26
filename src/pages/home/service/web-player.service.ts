import { makeAutoObservable } from "mobx";
import { StateToggler } from "~/shared/lib/state-toggler";

export class WebPlayerService {
  playerInstance: Spotify.Player | null = null;
  currentTrack: Spotify.Track | null = null;
  isPaused = false;
  playerReady = new StateToggler();
  deviceId = "";

  progress = 0;
  duration = 0;
  volume = 50;
  isMuted = false;
  previousVolume = 50;

  private progressInterval: number | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get currentActiveTrackId() {
    return this.currentTrack?.id;
  }

  setCurrentTrack(track: Spotify.Track) {
    this.currentTrack = track;
  }

  setIsPaused(isPaused: boolean) {
    this.isPaused = isPaused;
  }

  setPlayerInstance(player: Spotify.Player) {
    this.playerInstance = player;
    this.startProgressTracking();
  }

  private startProgressTracking() {
    this.stopProgressTracking();
    
    this.progressInterval = window.setInterval(() => {
      this.playerInstance?.getCurrentState().then((state) => {
        if (state) {
          this.setProgress(state.position);
        }
      });
    }, 1000);
  }

  private stopProgressTracking() {
    if (this.progressInterval) {
      window.clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  cleanup() {
    this.stopProgressTracking();
    this.playerInstance?.disconnect();
    this.playerInstance = null;
  }

  handlePlayPause() {
    this.playerInstance?.togglePlay();
  }

  handlePrevTrack() {
    this.playerInstance?.previousTrack();
  }

  handleNextTrack() {
    this.playerInstance?.nextTrack();
  }

  setProgress(progress: number) {
    this.progress = progress;
  }

  setDuration(duration: number) {
    this.duration = duration;
  }

  handleProgressChange(newPosition: number) {
    this.setProgress(newPosition);
    this.playerInstance?.seek(newPosition);
  }

  handleVolumeChange(newVolume: number) {
    this.volume = newVolume;
    this.isMuted = newVolume === 0;
    this.previousVolume = newVolume > 0 ? newVolume : this.previousVolume;
    this.playerInstance?.setVolume(newVolume / 100);
  }

  handleVolumeToggle() {
    if (this.isMuted) {
      this.volume = this.previousVolume;
      this.playerInstance?.setVolume(this.previousVolume / 100);
    } else {
      this.previousVolume = this.volume || 50;
      this.volume = 0;
      this.playerInstance?.setVolume(0);
    }
    this.isMuted = !this.isMuted;
  }
}
