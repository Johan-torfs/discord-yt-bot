import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { build } from './build.js';
import CommandsController from '../CommandsController.js';

export async function addCommand(commandName, songLink) {
    const regex = new RegExp('^[a-z]+$');
    if (!regex.test(commandName)) {
        return {content: 'Command name must only contain lowercase letters!', ephemeral: true };
    }

    if (CommandsController.getCommands().find(command => command.name == commandName)) {
        return {content: 'This command already exists!', ephemeral: true };
    }

    const command = {
        ...(new SlashCommandBuilder()
        .setName(commandName)
        .setDescription('Play a very specific song!')
        .setDefaultMemberPermissions(PermissionFlagsBits.Connect)
        .toJSON()),
        'function': (interaction) => build(interaction.member.voice?.channel, songLink),
    }

    CommandsController.getCommands().push(command);
    if (! (await CommandsController.registerApplicationCommands())) {
        CommandsController.getCommands().pop();
        return {content: 'Failed to add command ' + commandName + '!', ephemeral: true };
    }

    return {content: 'Command added!', ephemeral: true };
}