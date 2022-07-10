import { DailyForecast, WeatherRule } from "./interfaces";

export const RULES: WeatherRule[] = [
	{
		name: "Alert if rains the next day.",

		emailNotificationAddresses: ["horvath.marton96@gmail.com"],
		shouldActivate: (forecast: DailyForecast[]) => true,
		emailMessage: (forecast: DailyForecast[]) => ({
			subject: `[WeatherNotification] I'll rain tomorrow.`,
			message: `
				<p>Hello,</p>
                
				<p>Holnap ${forecast[0].pop}%-os valószínűséggel esni fog. Ne felejtsd el bevinni a párnákat a teraszról.</p>

                <p>Szép napot :)</p>
				<p>-- Weather notification bot</p>
            `,
		}),
	},
	{
		name: "Alert a week before freeze.",

		textMessageNotificationPhoneNumbers: ['+36202961419'],
		shouldActivate: (forecast: DailyForecast[]) => true,
		textMessage: (forecast: DailyForecast[]) => `[WeatherNotification] Storm is coming.`,
	},
];
