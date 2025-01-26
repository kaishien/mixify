import { inject, injectable } from "inversify";
import { $HttpClient, type HttpClient } from "~/config";

@injectable()
export class PlayerApi {
  constructor(@inject($HttpClient.SpotifyBase) private readonly httpClient: HttpClient) { }

  async playTrack(trackIds: string[], deviceId: string) {
    return this.httpClient.put(`/v1/me/player/play?device_id=${deviceId}`, {
      uris: trackIds,
    });
  }
}
