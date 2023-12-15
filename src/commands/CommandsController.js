import { baseCommands } from './commands.data.js';
import { Routes } from 'discord.js';

var REST;
var CLIENT_ID;
var GUILD_ID;
var commands;

async function start(rest, clientId, guildId) {
    REST = rest;
    CLIENT_ID = clientId;
    GUILD_ID = guildId;
    commands = [...baseCommands];

    await registerApplicationCommands();
    console.log('Started commands controller.');
}

async function registerApplicationCommands() {   
    try {
        await REST.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands },
        );
    } catch (error) {
        console.log(error);
        return false;
    }

    return true;
}

function getCommands() {
    return commands;
}

function setCommands(newCommands) {
    commands = newCommands;
}


const CommandsController = {
    start,
    registerApplicationCommands,
    getCommands,
    setCommands,
};

export default CommandsController;