import { createAudioPlayer, createAudioResource, AudioPlayerStatus } from '@discordjs/voice';
import { EmbedBuilder } from 'discord.js';

import playdl from 'play-dl';
import ChannelController from '../channel/ChannelController.js';

var player;
var queueArray = [];
var nextId = 1;

function play(songLink, insert = false) {
    createPlayer();
    const { songInfo, embed } = getSongInfo(songLink);

    let stream = playdl.stream_from_info(songInfo)
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
    const songInfo = await play.video_info(link);
    const embed = createEmbedMessage(songInfo.video_details);

    return { songInfo, embed };
}

export default SongController = {
    play,
    skip,
    stop,
    showQueue,
    remove
}