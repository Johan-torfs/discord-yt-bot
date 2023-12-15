import { ChannelType, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

import { addCommand } from './functions/addcommand.js';
import { removeCommand } from './functions/removecommand.js';
import { join } from './functions/join.js';
import { leave } from './functions/leave.js';
import { play } from './functions/play.js';
import { insert } from './functions/insert.js';
import { skip } from './functions/skip.js';
import { stop } from './functions/stop.js';
import { queue } from './functions/queue.js';
import { remove } from './functions/remove.js';
import { replay } from './functions/replay.js';
import { build } from './functions/build.js';

export const baseCommands = [
    {
        ...(new SlashCommandBuilder()
        .setName('addcommand')
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
        'function': (interaction) => addCommand(interaction.options.getString('command'), interaction.options.getString('link')),
        ephermeral: true,
    },
    {
        ...(new SlashCommandBuilder()
        .setName('removecommand')
        .setDescription('Remove a command')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption((option) =>
            option
                .setName('command')
                .setDescription('Name of the command')
                .setRequired(true)
        ).toJSON()),
        'function': (interaction) => removeCommand(interaction.options.getString('command')),
        ephermeral: true,
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
            'function': (interaction) => join(interaction.options.getChannel('channel')),
    },
    {
        ...(new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Leave the voice channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Connect)
        .toJSON()),
        'function': (interaction) => leave(),
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
        'function': (interaction) => play(interaction.member.voice?.channel, interaction.options.getString('link')),
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
        'function': (interaction) => insert(interaction.member.voice?.channel, interaction.options.getString('link')),
    },
    {
        ...(new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip the current song')
        .setDefaultMemberPermissions(PermissionFlagsBits.Connect)
        .toJSON()),
        'function': (interaction) => skip(interaction.member.voice?.channel),
    },
    {
        ...(new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop all songs and empty queue')
        .setDefaultMemberPermissions(PermissionFlagsBits.Connect)
        .toJSON()),
        'function': (interaction) => stop(interaction.member.voice?.channel),
    },
    {
        ...(new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Show all songs in queue')
        .setDefaultMemberPermissions(PermissionFlagsBits.Connect)
        .toJSON()),
        'function': (interaction) => queue(interaction.member.voice?.channel),
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
        'function': (interaction) => remove(interaction.member.voice?.channel, interaction.options.getInteger('id'))
    },
    {
        name: 'replay',
        type: 3,
        'function': (interaction) => replay(interaction.member.voice?.channel, interaction.targetMessage.embeds),
    },
    {
        ...(new SlashCommandBuilder()
        .setName('build')
        .setDescription('Play a very specific song!')
        .setDefaultMemberPermissions(PermissionFlagsBits.Connect)
        .toJSON()),
        'function': (interaction) => build(interaction.member.voice?.channel, 'https://youtu.be/j8068ZrwicQ?si=R55xb5vqzLyigdZL'),
    },
]