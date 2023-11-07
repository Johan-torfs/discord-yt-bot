import { Client, REST, GatewayIntentBits } from 'discord.js';

import { registerApplicationCommands, startInteractionListener } from './commands.js';

//Import ENV variables from .env file
import 'dotenv/config';
const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const CLIENT_ID = process.env.CLIENT_ID;

var started = false;

export default function startBot() {
    if (started) return;
    started = true;

    // Create REST and WebSocket managers directly
    const rest = new REST({ version: '10' }).setToken(TOKEN);

    // Create a client to emit relevant events.
    const client = new Client({ 
        intents: [
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.Guilds,
            GatewayIntentBits.MessageContent,
        ]
    });

    // Listen for the ready event
    client.once('ready', () => console.log('Ready!'));

    registerApplicationCommands(rest, CLIENT_ID, GUILD_ID);
    startInteractionListener(client);

    client.login(TOKEN);
}
