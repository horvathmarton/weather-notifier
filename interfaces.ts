export interface DailyForecast {
	/** Datetime in epoch. */
	dt: number;

	main: {
		temp: number;
		feels_like: number;
		temp_min: number;
		temp_max: number;
	};

	weather: {
		main: string;
		description: string;
	}[];

	clouds: {
		/** Cloudiness, % */
		all: number;
	};

	wind: {
		/** Wind speed meter/sec */
		speed: number;
	};

	/** Probability of precipitation. */
	pop: number;

	/** Precipitation volume, mm */
	rain?: number;

	/** Snow volume, mm */
	snow?: number;
}

export interface WeatherRule {
	/** Human readable name of the rule. */
	name: string;

	/** Returns true if the rule should be activated today. */
	shouldActivate: (forecast: DailyForecast[]) => boolean;

	/** List of email addresses the notification should be sent to. */
	emailNotificationAddresses?: string[];

	/** HTML formatted email message and string subject, if either this or `emailNotificationAddresses` is not defined the email won't be sent. */
	emailMessage?: (forecast: DailyForecast[]) => { subject: string; message: string };

	/** List of phone numbers, the notification text should be sent to. */
	textMessageNotificationPhoneNumbers?: string[];

	/** Formatted text message, if either this or `textMessageNotificationPhoneNumbers` is not defined no text message will be sent. */
	textMessage?: (forecast: DailyForecast[]) => string;
}
