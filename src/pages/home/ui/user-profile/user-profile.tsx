import { observer } from "mobx-react-lite";
import type { PrivateUser } from "spotify-types";
import { useInjection } from "~/config";
import type { UserService } from "~/services/user";
import { UserServiceContainerToken } from "~/services/user";
import { Badge, Typography } from "~/shared/ui/components";
import styles from "./user-profile.module.css";

type AvatarProps = {
	userName?: PrivateUser["display_name"];
	images?: PrivateUser["images"];
};

const Avatar = ({ userName, images }: AvatarProps) => {
	const name = userName ?? "You";
	const firstLetter = name.charAt(0);

	if (images?.length) {
		return <img className={styles.avatarImage} src={images[0].url} alt={name} />;
	}

	return <div className={styles.avatarLetter}>{firstLetter}</div>;
};

export const UserProfile = observer(() => {
	const userService = useInjection<UserService>(UserServiceContainerToken.UserService);

	return (
		<article className={styles.userProfile}>
			<div className={styles.userProfileInfo}>
				<Avatar userName={userService.user?.display_name} images={userService.user?.images} />
				<Typography tag="h1">{userService.user?.display_name}</Typography>
				<Typography color="gray" tag="span">
					{userService.user?.email}
				</Typography>
			</div>
			<div>
				<Badge color="primary">{userService.user?.product}</Badge>
			</div>
		</article>
	);
});
