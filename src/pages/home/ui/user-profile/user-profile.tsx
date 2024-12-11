import { observer } from "mobx-react-lite";
import type { PrivateUser } from "spotify-types";
import { useInjection } from "~/config";
import type { UserService } from "~/services/user";
import { UserServiceContainerToken } from "~/services/user";
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
		<article>
			<Avatar userName={userService.user?.display_name} images={userService.user?.images} />
			<div className={styles.userProfileInfo}>
				<h1 className={styles.userProfileName}>{userService.user?.display_name}</h1>
				<p className={styles.userProfileEmail}>{userService.user?.email}</p>
			</div>
		</article>
	);
});
