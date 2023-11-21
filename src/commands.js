import { Routes, ChannelType, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

import {join, leave} from './join.js';
import {playCommand, skipCommand, stopCommand, queueCommand, removeCommand, replayCommand, buildCommand} from './play.js';

// JSON with available commands and their functions
const commands = [
    {
            ...(new SlashCommandBuilder()
            .setName('join')
            .setDescription('Join a voice channel')
            .setDefaultMemberPermissions(PermissionFlagsBits.Connect)
            .addChannelOption((option) => 
                option
                    .setName('channel')
                    .setDescription('The channel to join')
                    .setRequired(true)
                    .addChannelTypes(ChannelType.GuildVoice)
            ).toJSON()),
            'function': join,
    },
    {
        ...(new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Leave the voice channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Connect)
        .toJSON()),
        'function': leave,
    },
    {
        ...(new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a youtube song')
        .setDefaultMemberPermissions(PermissionFlagsBits.Connect)
        .addStringOption((option) =>
            option
                .setName('link')
                .setDescription('The song to play')
                .setRequired(true)
        ).toJSON()),
        'function': playCommand,
    },
    {
        ...(new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip the current song')
        .setDefaultMemberPermissions(PermissionFlagsBits.Connect)
        .toJSON()),
        'function': skipCommand,
    },
    {
        ...(new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop all songs and empty queue')
        .setDefaultMemberPermissions(PermissionFlagsBits.Connect)
        .toJSON()),
        'function': stopCommand,
    },
    {
        ...(new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Show all songs in queue')
        .setDefaultMemberPermissions(PermissionFlagsBits.Connect)
        .toJSON()),
        'function': queueCommand,
    },
    {
        ...(new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Remove a song from the queue')
        .setDefaultMemberPermissions(PermissionFlagsBits.Connect)
        .addIntegerOption((option) =>
            option
                .setName('id')
                .setDescription('The number of the song to remove')
                .setRequired(true)
        ).toJSON()),
        'function': removeCommand,
    },
    {
        name: 'replay',
        type: 3,
        'function': replayCommand,
    },
    {
        ...(new SlashCommandBuilder()
        .setName('build')
        .setDescription('Play a very specific song!')
        .setDefaultMemberPermissions(PermissionFlagsBits.Connect)
        .toJSON()),
        'function': buildCommand,
    },
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
        const command = commands.find(command => command.name == interaction.commandName);
        if (command) command.function(interaction);
    });
}

export { registerApplicationCommands, startInteractionListener };