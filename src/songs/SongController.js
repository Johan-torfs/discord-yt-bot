import { createAudioPlayer, createAudioResource, AudioPlayerStatus } from '@discordjs/voice';
import { EmbedBuilder } from 'discord.js';

import playdl from 'play-dl';
import ChannelController from '../channel/ChannelController.js';

var player;
var queueArray = [];
var nextId = 1;

function play(songLink, insert = false) {
    createPlayer();
    
    const { result, success } = getSongInfo(songLink);
    if (!success) return result;

    const { songInfo, embed } = result;

    let stream;
    try {
        stream = playdl.stream_from_info(songInfo);
    } catch (error) {
        if (error.code = 429) return {reply: { content: 'Too many requests!' }, success: false };
        return {reply: { content: 'Song request failed!', ephemeral: true }, success: false };
    }

    let resource = createAudioResource(stream.stream, {
        inputType: stream.type
    })

    if (insert) {
        queueArray = [
            ...queueArray.slice(0, 1),
            { resource: resource, info: {...songInfo.video_details, id: nextId++}, embed: embed },
            ...queueArray.slice(1)
        ]
    } else {
        queueArray.push({ resource: resource, info: {...songInfo.video_details, id: nextId++}, embed: embed });
    }

    if (player.state.status == AudioPlayerStatus.Idle) playNext(false);

    return {reply: { embeds: [embed] }, success: true };
}

function skip() {
    if (queueArray.length == 0) return {reply: { content: 'No song to skip!', ephemeral: true }};

    const title = queueArray[0].info.title;
    playNext();
    return {reply: { content: 'Skipped ' + title + '!' }};
}

function stop() {
    player.stop();
    queueArray = [];
    return {reply: { content: 'Stopped!' }};
}

function showQueue() {
    return {reply: { content: queueArray.map((item, index) => (
        index == 0 
        ? '**Now Playing:** ' + item.info.title
        : item.info.id + ': ' + item.info.title
    )).join('\n') }};
}

function remove(id) {
    const index = queueArray.findIndex((item) => item.info.id == id);

    if (index == -1) return {reply: { content: 'Not found!', ephemeral: true }};

    const title = queueArray[index].info.title;
    queueArray.splice(index, 1);
    
    return {reply: { content: 'Removed ' + title + '!' }};
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


function createPlayer() {
    if (player) return;

    player = createAudioPlayer();

    player.on(AudioPlayerStatus.Idle, () => {
        playNext();
    });

    player.on('error', error => {
        console.error(error);
        playNext();
    });

    ChannelController.getConnection().subscribe(player);
}

async function getSongInfo(link) {
    var songInfo;
    try {
        songInfo = await playdl.video_info(link);
    } catch (error) {
        return {result: { content: 'Failed to get link!', ephemeral: true }, success: false};
    }
    const embed = createEmbedMessage(songInfo.video_details);

    return {result: { songInfo, embed }, success: true};
}

const SongController = {
    play,
    skip,
    stop,
    showQueue,
    remove
};

export default SongController;