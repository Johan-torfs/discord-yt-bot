import { Client, REST, GatewayIntentBits } from 'discord.js';
import CommandsController from './commands/CommandsController.js';
import InteractionController from './interactions/InteractionController.js';

//Import ENV variables from .env file
import 'dotenv/config';
const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const CLIENT_ID = process.env.CLIENT_ID;

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

CommandsController.start(rest, CLIENT_ID, GUILD_ID);
InteractionController.start(client);

client.login(TOKEN);
