import { inject, injectable } from "inversify";
import { makeAutoObservable } from "mobx";
import type { Track } from "spotify-types";
import { PlayerApi } from "~/shared/api";

export const MixedPlaylistServiceContainerToken = Symbol.for("MixedPlaylistService");

@injectable()
export class MixedPlaylistService {
  mixedPlaylist: Track[] = [];
  deviceId = "";

  constructor(@inject(PlayerApi) private readonly playerApi: PlayerApi) {
    makeAutoObservable(this);
  }

  updateMixedPlaylist(tracks: Track[]) {
    this.mixedPlaylist = tracks;
  }

  updateDeviceId(deviceId: string) {
    this.deviceId = deviceId;
  }

  get mixedTracksUris() {
    return this.mixedPlaylist.map((track) => track.uri);
  }

  async playMixedPlaylist() {
    if (!this.deviceId) return;

    await this.playerApi.playTrack(this.mixedTracksUris, this.deviceId);
  }

  async playTrack(trackId: string) {
    if (!this.deviceId) return;

    await this.playerApi.playTrack([trackId], this.deviceId);
  }
}
