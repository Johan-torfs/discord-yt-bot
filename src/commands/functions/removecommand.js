import CommandsController from '../CommandsController.js';
import { baseCommands } from '../commands.data.js';

export async function removeCommand(commandName) {
    if (baseCommands.find(command => command.name == commandName)) {
        return {content: 'This command is not removable!', ephemeral: true };
    }

    const command = CommandsController.getCommands().find(command => command.name == commandName);
    if (!command) {
        return {content: 'This command does not exist!', ephemeral: true };
    }

    CommandsController.setCommands(CommandsController.getCommands().filter(command => command.name != commandName));

    if (! (await CommandsController.registerApplicationCommands())) {
        CommandsController.getCommands().push(command);
        return {content: 'Failed to remove command ' + commandName + '!', ephemeral: true };
    }

    return {content: 'Command removed!', ephemeral: true };
}