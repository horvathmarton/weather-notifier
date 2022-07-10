require('dotenv-safe').config();

import axios from 'axios';
import sendgrid from '@sendgrid/mail';
import twilio from 'twilio';
import { DailyForecast } from './interfaces';
import { RULES } from './rules';

const BASE_URL = 'http://api.openweathermap.org';
const CITY = 'Budapest';
const FORECASTED_DAYS = 10; // Max 16
const { OPEN_WEATHER_API_KEY, SENDGRID_API_KEY, TWILIO_ACCOUNT_SID, TWILIO_AUTH_KEY } = process.env as Record<string, string>;

async function fetchAndParseWeatherData(): Promise<DailyForecast[]> {
    console.log(`Fetching daily weather forecast.`);

    const response = await axios.get<{ list: DailyForecast[] }>(`${BASE_URL}/data/2.5/forecast?appid=${OPEN_WEATHER_API_KEY}&q=${CITY}&cnt=${FORECASTED_DAYS}&unit=metric`);

    /** Remove every unused property. */
    return response.data.list.map(item => ({
        dt: item.dt,
        main: {
            temp: item.main.temp,
            feels_like: item.main.feels_like,
            temp_min: item.main.temp_min,
            temp_max: item.main.temp_max,
        },
        weather: item.weather.map(w => ({ main: w.main, description: w.description })),
        clouds: {
            all: item.clouds.all,
        },
        wind: {
            speed: item.wind.speed,
        },
        pop: item.pop,
        rain: item.rain,
        snow: item.snow,
    }));
}

async function sendEmail(addresses: string[], subject: string, message: string): Promise<void> {
    sendgrid.setApiKey(SENDGRID_API_KEY);

    const email = {
        to: addresses,
        from: 'horvath.marton96@gmail.com',
        subject,
        html: message,
    };

    console.log(`Sending ${subject} to ${addresses}.`);

    await sendgrid.send(email);
}

async function sendTextMessage(phoneNumber: string, message: string): Promise<void> {
    const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_KEY);
    const sms = {
        from: '+13156653670',
        to: phoneNumber,
        body: message,
    };

    console.log(`Sending text (${message}) to ${phoneNumber}.`);

    await twilioClient.messages.create(sms);
}

export async function main(event, context): Promise<void> {
    console.log(`Function is called.`);
    console.log({ event, context });

    const forecast = await fetchAndParseWeatherData();
    const activeRules = RULES.filter(rule => rule.shouldActivate(forecast));

    for (const email of activeRules.filter(email => email.emailNotificationAddresses !== undefined && email.emailMessage !== undefined)) {
        const { subject, message } = (email as { emailMessage: (f: DailyForecast[]) => { subject: string, message: string } }).emailMessage(forecast);

        await sendEmail((email as { emailNotificationAddresses: string[] }).emailNotificationAddresses, subject, message);
    }

    for (const sms of activeRules.filter(sms => sms.textMessageNotificationPhoneNumbers !== undefined && sms.textMessage !== undefined)) {
        const message = (sms as { textMessage: (f: DailyForecast[]) => string }).textMessage(forecast);

        for (const recipient of (sms as { textMessageNotificationPhoneNumbers: string[] }).textMessageNotificationPhoneNumbers) {
            try {
                await sendTextMessage(recipient, message);
            } catch (error) {
                console.warn(`Couldn't send text message, because ${recipient} is not a verified phone number.`)
            }
        }
    }
}

main(null, null);
