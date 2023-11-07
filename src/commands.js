import { Routes } from 'discord.js';

import {join, leave} from './join.js';
import {playCommand, skipCommand, stopCommand} from './play.js';

// JSON with available commands and their functions
const commands = [
    {
        'name': 'join',
        'description': 'Join your voice channel',
        'options': [
            {
                'name': 'channel',
                'type': 7,
                'description': 'The channel to join',
                'required': true,
            }
        ],
        'function': join,
    },
    {
        'name': 'leave',
        'description': 'Leave your voice channel',
        'function': leave,
    },
    {
        'name': 'play',
        'description': 'Play a song',
        'options': [
            {
                'name': 'link',
                'type': 3,
                'description': 'The song to play',
                'required': true,
            }
        ],
        'function': playCommand,
    },
    {
        'name': 'skip',
        'description': 'Skip the current song',
        'function': skipCommand,
    },
    {
        'name': 'stop',
        'description': 'Stop playing songs',
        'function': stopCommand,
    }
];

async function registerApplicationCommands(rest, clientId, guildId) {   
    try {
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );
    } catch (error) {
        console.log(error);
    }
}

async function startInteractionListener(client) {
    client.on('interactionCreate', (interaction) => {
        if (!interaction.isChatInputCommand()) return;

        const command = commands.find(command => command.name == interaction.commandName);
        if (command) command.function(interaction);
    });
}

export { registerApplicationCommands, startInteractionListener };