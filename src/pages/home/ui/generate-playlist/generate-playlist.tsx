import type { MixGenresService } from "../../service/mix-genres.service";

import { container } from "~/application/register-dependencies";
import { Button } from "~/shared/ui/components";
import { MixGenresServiceContainerToken } from "../../service/mix-genres.service";

export const GeneratePlaylist = () => {
	const mixGenresService = container.get<MixGenresService>(
		MixGenresServiceContainerToken.MixGenresService,
	);

	return (
		<div>
			<Button
				onClick={() =>
					mixGenresService.createMixPlaylist({
						name: "Mix Genres",
						description: "Mix Genres",
					})
				}
			>
				Generate playlist
			</Button>
		</div>
	);
};
