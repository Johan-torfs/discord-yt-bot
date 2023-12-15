import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { insert } from './insert.js';

export async function addCommand(commandName, songLink) {
    const regex = new RegExp('^[a-z]+$');
    if (!regex.test(commandName)) {
        return {content: 'Command name must only contain lowercase letters!', ephemeral: true };
    }

    if (commands.find(command => command.name == commandName)) {
        return {content: 'This command already exists!', ephemeral: true };
    }

    const command = {
        ...(new SlashCommandBuilder()
        .setName(commandName)
        .setDescription('Play a very specific song!')
        .setDefaultMemberPermissions(PermissionFlagsBits.Connect)
        .toJSON()),
        'function': (interaction) => insert(interaction.member.voice?.channel, interaction.options.getString('link')),
    }

    commands.push(command);
    if (! (await registerApplicationCommands())) {
        commands.pop();
        return {content: 'Failed to add command ' + commandName + '!', ephemeral: true };
    }

    return {content: 'Command added!', ephemeral: true };
}