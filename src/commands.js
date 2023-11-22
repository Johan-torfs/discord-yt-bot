import { Routes, ChannelType, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

import {join, leave} from './join.js';
import {playCommand, skipCommand, stopCommand, queueCommand, removeCommand, replayCommand, customSongCommand, insertCommand} from './play.js';
import { Interaction } from './interactionReplyHandler.js';

var REST = null;
var CLIENT_ID = null;
var GUILD_ID = null;

// JSON with available commands and their functions
const baseCommands = [
    {
        ...(new SlashCommandBuilder()
        .setName('command')
        .setDescription('Add a command to play a specific song')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption((option) =>
            option
                .setName('command')
                .setDescription('Name of the command')
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName('link')
                .setDescription('Link to the song')
                .setRequired(true)
        ).toJSON()),
        'function': addCommandToCommandList,
    },
    {
        ...(new SlashCommandBuilder()
        .setName('commandremove')
        .setDescription('Remove a command')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption((option) =>
            option
                .setName('command')
                .setDescription('Name of the command')
                .setRequired(true)
        ).toJSON()),
        'function': removeCommandFromCommandList,
    },
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
        .setDescription('Play a youtube song, add it to the queue')
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
        .setName('insert')
        .setDescription('Play a youtube song right after the next one playing now')
        .setDefaultMemberPermissions(PermissionFlagsBits.Connect)
        .addStringOption((option) =>
            option
                .setName('link')
                .setDescription('The song to play')
                .setRequired(true)
        ).toJSON()),
        'function': insertCommand,
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
        'function': (interaction) => customSongCommand(interaction, 'https://youtu.be/j8068ZrwicQ?si=R55xb5vqzLyigdZL'),
    },
];

var commands = [...baseCommands];

async function registerApplicationCommands(rest, clientId, guildId) {   
    REST = rest;
    CLIENT_ID = clientId;
    GUILD_ID = guildId;

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

async function addCommandToCommandList(interaction) {
    const interactionHandler = new Interaction(interaction);
    const commandName = interaction.options.getString('command');
    const songLink = interaction.options.getString('link');
    const command = {
        ...(new SlashCommandBuilder()
        .setName(commandName)
        .setDescription('Play a very specific song!')
        .setDefaultMemberPermissions(PermissionFlagsBits.Connect)
        .toJSON()),
        'function': (interaction) => customSongCommand(interaction, songLink),
    }
    try {
        await REST.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: [...commands, command] },
        );
        interactionHandler.interactionReply(interaction, {content: 'Command added!', ephemeral: true });
    } catch (error) {
        interactionHandler.interactionReply(interaction, {content: 'Something went wrong!', ephemeral: true });
        console.log(error);
        return;
    }
    commands.push(command);
}

async function removeCommandFromCommandList(interaction) {
    const interactionHandler = new Interaction(interaction);
    const commandName = interaction.options.getString('command');

    if (baseCommands.find(command => command.name == commandName)) {
        interactionHandler.interactionReply(interaction, {content: 'This command is not removable!', ephemeral: true });
        return;
    }

    try {
        await REST.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands.filter(command => command.name != commandName) },
        );
        interactionHandler.interactionReply(interaction, {content: 'Command removed!', ephemeral: true });
    } catch (error) {
        interactionHandler.interactionReply(interaction, {content: 'Something went wrong!', ephemeral: true });
        console.log(error);
        return;
    }
    commands = commands.filter(command => command.name != commandName);
}

export { registerApplicationCommands, startInteractionListener };