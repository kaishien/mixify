import { observer } from "mobx-react-lite";
import { useInjection } from "~/config";
import type { UserService } from "~/services/user";
import { UserServiceContainerToken } from "~/services/user";
import { Avatar, Badge, ButtonIcon, Typography } from "~/shared/ui/components";

import styles from "./user-profile.module.scss";

import type { AuthService } from "~/services/auth";
import { AuthServiceContainerToken } from "~/services/auth";
import LogoutIcon from "~/shared/ui/assets/logout-icon.svg?react";

export const UserProfile = observer(() => {
	const authService = useInjection<AuthService>(AuthServiceContainerToken.AuthService);
	const userService = useInjection<UserService>(UserServiceContainerToken.UserService);

	const userName = userService.user?.display_name ?? "You";
	const firstLetter = userName.charAt(0);

	return (
		<article className={styles.userProfile}>
			<div className={styles.userProfileInfo}>
				<div className={styles.userProfileInfoHeader}>
					<Avatar
						size="large"
						letter={firstLetter}
						src={userService.user?.images?.[0]?.url ?? ""}
						alt={userService.user?.display_name ?? ""}
					/>
					<ButtonIcon icon={<LogoutIcon />} onClick={() => authService.logout()} />
				</div>
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
