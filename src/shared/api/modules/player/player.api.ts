import { inject, injectable } from "inversify";
import { HttpClientToken, type HttpClient } from "~/config";

@injectable()
export class PlayerApi {
  constructor(@inject(HttpClientToken.SpotifyBase) private readonly httpClient: HttpClient) {}

  async playTrack(trackIds: string[], deviceId: string) {
    return this.httpClient.put(`/v1/me/player/play?device_id=${deviceId}`, {
      uris: trackIds,
    });
  }
}
