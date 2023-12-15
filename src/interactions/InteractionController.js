import CommandsController from "../commands/CommandsController.js";

const RETRY_LIMIT = 2;

var CLIENT;
var deferQueue = [];
var commandQueue = [];
var followUpQueue = [];

export async function start(client) {
    CLIENT = client;
    await startInteractionListener();
    startFollowUpProcessing();
    startInteractionProcessing();
    startDeferProcessing();
}

async function startInteractionListener() {
    CLIENT.on('interactionCreate', async (interaction) => {
        const command = CommandsController.getCommands().find(command => command.name == interaction.commandName);

        if (!command) interactionReply(interaction, {content: 'This command does not exist!', ephemeral: true });

        deferQueue.push({interaction, command, count: 0});
    });
}

async function startDeferProcessing() {
    while (deferQueue.length > 1) await processDefer();
    setTimeout(startDeferProcessing, 500);
}

async function processDefer() {
    const { interaction, command, count } = deferQueue.shift();

    const success = await interactionDefer(interaction, {ephemeral: !!command.ephemeral});
    if (!success) {
        if (count >= RETRY_LIMIT) {
            interactionReply(interaction, {content: 'Something went wrong!', ephemeral: true });
            return;
        }
        deferQueue.push({interaction, command, count: count + 1});
    }
}

async function interactionDefer(interaction, options = {}) {
    try {
        await interaction.deferReply(options);
        return true;
    } catch (error) {
        if (error.code = 40060) {
            console.log('Interaction has already been acknowledged.');
            return true;
        }
        return false;
    }
}

async function startInteractionProcessing() {
    while (commandQueue.length > 1) await processInteraction();
    setTimeout(startInteractionProcessing, 1000);
}

async function processInteraction() {
    const { interaction, command } = commandQueue.shift();
    const reply = await command.function(interaction);
    followUpQueue.push({interaction, reply, count: 0});
}

async function startFollowUpProcessing() {
    while (followUpQueue.length > 1) await processFollowUp();
    setTimeout(startFollowUpProcessing, 500);
}

async function processFollowUp() {
    const { interaction, reply, count } = followUpQueue.shift();

    const success = await interactionFollowUp(interaction, reply);
    if (!success) {
        if (count >= RETRY_LIMIT) {
            interactionFollowUp(interaction, {content: 'Something went wrong!', ephemeral: true });
            return;
        }
        followUpQueue.push({interaction, reply, count: count + 1});
    }
}

async function interactionFollowUp(interaction, options = {}) {
    try {
        await interaction.followUp(options);
        return true;
    } catch (error) {
        if (error.code = 40060) {
            console.log('Interaction has already been acknowledged.');
            return true;
        }
        return false;
    }
}

async function interactionReply(interaction, options = {}) {
    try {
        await interaction.reply(options);
    } catch (error) {
        if (error.code = 40060) {
            console.log('Interaction has already been acknowledged.');
            return;
        }
        console.log(error);
    }
}

export default InteractionController = {
    start,
}