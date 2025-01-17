import { injectable } from "inversify";
import { type ExternalToast, toast } from "sonner";

export interface INotificationService {
	showError(message: string): void;
	showSuccess(message: string): void;
	showInfo(message: string): void;
}

export const NotificationServiceToken = Symbol.for("NotificationServiceToken");

@injectable()
export class NotificationService implements INotificationService {
	private options: ExternalToast = {
		duration: 5000,
		position: "top-right",
	};

	showError(message: string) {
		toast.error(message, this.options);
	}

	showSuccess(message: string) {
		toast.success(message, this.options);
	}

	showInfo(message: string) {
		toast.info(message);
	}
}
