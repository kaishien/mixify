import { inject, injectable } from "inversify";
import { makeAutoObservable } from "mobx";
import type { Track } from "spotify-types";
import type { INotificationService } from "~/services/notification";
import { NotificationServiceToken } from "~/services/notification";
import type { UserService } from "~/services/user/user.service";
import { UserServiceContainerToken } from "~/services/user/user.service";
import { PlayerApi, PlaylistsApi } from "~/shared/api";
import { LoaderProcessor } from "~/shared/lib/loader-processor";

export const MixedPlaylistServiceContainerToken = Symbol.for("MixedPlaylistService");

@injectable()
export class MixedPlaylistService {
  mixedPlaylist: Track[] = [];
  deviceId = "";

  addingToLibraryLoader = new LoaderProcessor();


  constructor(
    @inject(PlayerApi) private readonly playerApi: PlayerApi,
    @inject(UserServiceContainerToken.UserService) private userService: UserService,
    @inject(PlaylistsApi) private readonly playlistsApi: PlaylistsApi,
    @inject(NotificationServiceToken) private readonly notificationService: INotificationService,
  ) {
    makeAutoObservable(this, {}, { autoBind: true });
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

  async addMixedPlaylistToUserLibrary(
    playlistConfig: {
      name: string;
      description: string;
    },
  ) {
    this.addingToLibraryLoader.setIsLoading(true);

    try {
      const userId = this.userService.user?.id;
      if (!userId) return;

      const createdPlaylist = await this.playlistsApi.createPlaylist(
        userId,
        playlistConfig.name,
        playlistConfig.description,
        true,
      );

      await this.playlistsApi.addTracksToPlaylist(createdPlaylist.id, this.mixedTracksUris);

      this.notificationService.showSuccess("Playlist added to library");
    } catch (error) {
      this.notificationService.showError("Failed to add playlist to library");
    } finally {
      this.addingToLibraryLoader.setIsLoading(false);
    }
  }
}
