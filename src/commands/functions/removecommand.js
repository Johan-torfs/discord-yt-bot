export async function removeCommand(commandName) {
    if (baseCommands.find(command => command.name == commandName)) {
        return {content: 'This command is not removable!', ephemeral: true };
    }

    const command = commands.find(command => command.name == commandName);
    if (!command) {
        return {content: 'This command does not exist!', ephemeral: true };
    }

    commands = commands.filter(command => command.name != commandName);

    if (! (await registerApplicationCommands())) {
        commands.push(command);
        return {content: 'Failed to remove command ' + commandName + '!', ephemeral: true };
    }

    return {content: 'Command removed!', ephemeral: true };
}