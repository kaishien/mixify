import type { MixGenresService } from "../../service/mix-genres.service";

import { container } from "~/application/register-dependencies";
import { MixGenresServiceContainerToken } from "../../service/mix-genres.service";

export const GeneratePlaylist = () => {
	const mixGenresService = container.get<MixGenresService>(
		MixGenresServiceContainerToken.MixGenresService,
	);

	return (
		<div>
			<button type="button" onClick={() => mixGenresService.createMixPlaylist()}>
				Generate playlist
			</button>
		</div>
	);
};
