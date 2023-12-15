import CommandsController from '../CommandsController.js';
import { commands } from '../commands.data.js';

export async function removeCommand(commandName) {
    if (commands.find(command => command.name == commandName)) {
        return {content: 'This command is not removable!', ephemeral: true };
    }

    const command = CommandsController.getCommands().find(command => command.name == commandName);
    if (!command) {
        return {content: 'This command does not exist!', ephemeral: true };
    }

    CommandsController.setCommands(CommandsController.getCommands().filter(command => command.name != commandName));

    if (! (await registerApplicationCommands())) {
        CommandsController.getCommands().push(command);
        return {content: 'Failed to remove command ' + commandName + '!', ephemeral: true };
    }

    return {content: 'Command removed!', ephemeral: true };
}