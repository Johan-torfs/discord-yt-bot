import { createAudioPlayer, getVoiceConnection, createAudioResource, AudioPlayerStatus } from '@discordjs/voice';
import { EmbedBuilder } from 'discord.js';
import { joinChannel } from './join.js';

import { Interaction } from './interactionReplyHandler.js';

import play from 'play-dl';

var player;
var queueArray = [];
var nextId = 1;

export async function playCommand(interaction) {
    const interactionHandler = new Interaction(interaction);
    const connection = checkVoiceChannelAndJoin(interactionHandler, interaction);
    if (!connection) return;

    await createPlayer();
    connection.subscribe(player);

    const { songInfo, embed } = await getSongInfoAndReply(interactionHandler, interaction, interaction.options.getString('link'));

    let stream = await play.stream_from_info(songInfo)
    let resource = createAudioResource(stream.stream, {
        inputType: stream.type
    })

    queueArray.push({ resource: resource, info: {...songInfo.video_details, id: nextId++}, embed: embed });
    if (player.state.status == AudioPlayerStatus.Idle) playNext(false);
}

export async function buildCommand(interaction) {
    const interactionHandler = new Interaction(interaction);
    const connection = checkVoiceChannelAndJoin(interactionHandler, interaction);
    if (!connection) return;

    await createPlayer();
    connection.subscribe(player);

    const { songInfo, embed } = await getSongInfoAndReply(interaction, 'https://youtu.be/j8068ZrwicQ?si=R55xb5vqzLyigdZL');

    let stream = await play.stream_from_info(songInfo)
    let resource = createAudioResource(stream.stream, {
        inputType: stream.type
    })

    queueArray = [
        ...queueArray.slice(0, 1),
        { resource: resource, info: {...songInfo.video_details, id: nextId++}, embed: embed },
        ...queueArray.slice(1)
    ] 
    playNext(player.state.status != AudioPlayerStatus.Idle);
}

export async function replayCommand(interaction) {
    const interactionHandler = new Interaction(interaction);
    const connection = checkVoiceChannelAndJoin(interactionHandler, interaction);
    if (!connection) return;

    if (interaction.targetMessage.embeds.length == 0) {
        interactionHandler.interactionReply({content: 'No song in this message!', ephemeral: true });
        return;
    }

    const embed = interaction.targetMessage.embeds[0];
    if (!embed.url) {
        interactionHandler.interactionReply({content: 'No song in this message!', ephemeral: true });
        return;
    }

    await createPlayer();
    connection.subscribe(player);

    const { songInfo } = await getSongInfoAndReply(interaction, embed.url);

    let stream = await play.stream_from_info(songInfo)
    let resource = createAudioResource(stream.stream, {
        inputType: stream.type
    })

    queueArray.push({ resource: resource, info: {...songInfo.video_details, id: nextId++}, embed: embed });
    if (player.state.status == AudioPlayerStatus.Idle) playNext(false);
}

export function skipCommand(interaction) {
    const interactionHandler = new Interaction(interaction);
    if (checkConnention(interactionHandler, interaction)) return;

    const title = queueArray[0].info.title;
    playNext();
    interactionHandler.interactionReply(interaction, { content: 'Skipped ' + title + '!' });
}

export async function stopCommand(interaction) {
    const interactionHandler = new Interaction(interaction);
    if (checkConnention(interactionHandler, interaction)) return;

    player.stop();
    queueArray = [];
    interactionHandler.interactionReply(interaction, { content: 'Stopped!' });
}

export async function queueCommand(interaction) {
    const interactionHandler = new Interaction(interaction);
    if (checkConnention(interactionHandler, interaction)) return;

    interactionHandler.interactionReply(interaction, { content: queueArray.map((item, index) => (
        index == 0 
        ? '**Now Playing:** ' + item.info.title
        : item.info.id + ': ' + item.info.title
    )).join('\n') });
}

export async function removeCommand(interaction) {
    const interactionHandler = new Interaction(interaction);
    if (checkConnention(interactionHandler, interaction)) return;

    const id = interaction.options.getInteger('id');
    const index = queueArray.findIndex((item) => item.info.id == id);
    if (index == -1) {
        interactionHandler.interactionReply(interaction, { content: 'Not found!', ephemeral: true });
        return;
    }

    const title = queueArray[index].info.title;
    queueArray.splice(index, 1);
    interactionHandler.interactionReply(interaction, { content: 'Removed ' + title + '!' });
}


// Helper functions
async function playNext(skip = true) {
    if (skip) queueArray.shift();

    if (queueArray.length > 0) {
        const next = queueArray[0];
        player.play(next.resource);
    } else {
        player.stop();
    }
}

function createEmbedMessage(details) {
    return new EmbedBuilder()
        .setTitle(details.title)
        .setDescription('Duration: ' + details.durationRaw)
        .setURL(details.url)
        .setThumbnail(details.thumbnails[0].url)
}


async function createPlayer() {
    if (player) return;

    player = createAudioPlayer();

    player.on(AudioPlayerStatus.Idle, () => {
        playNext();
    });

    player.on('error', error => {
        console.error(error);
        playNext();
    });
}

function checkVoiceChannelAndJoin(interactionHandler, interaction) {
    const connection = getVoiceConnection(interaction.guildId);

    if (!connection) {
        if (!interaction.member.voice?.channel) {
            interactionHandler.interactionReply(interaction, {content: 'Not connected!', ephemeral: true });
            return false;
        } else {
            connection = joinChannel(interaction.member.voice?.channel);
        }
    }

    return true;
}

function checkConnention(interactionHandler, interaction) {
    const connection = getVoiceConnection(interaction.guildId);

    if (!connection) {
        interactionHandler.interactionReply(interaction, {content: 'Not connected!', ephemeral: true });
        return false;
    }

    return true;
}

async function getSongInfoAndReply(interactionHandler, interaction, link) {
    const songInfo = await play.video_info(link);
    const embed = createEmbedMessage(songInfo.video_details);
    interactionHandler.interactionReply(interaction, { embeds: [embed] });

    return { songInfo, embed };
}