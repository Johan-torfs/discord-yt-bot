import { createAudioPlayer, createAudioResource, AudioPlayerStatus } from '@discordjs/voice';
import { EmbedBuilder } from 'discord.js';

import playdl from 'play-dl';
import ChannelController from '../channel/ChannelController.js';

var player;
var queueArray = [];
var nextId = 1;

async function play(songLink, insert = false, skip = false) {
    createPlayer();
    
    const { result, success } = await getSongInfo(songLink);
    if (!success) return {reply: result, success };

    const { songInfo, embed } = result;

    return await playSongInfo(songInfo, embed, insert, skip);
}

async function playlist(link) {
    const { result, success } = await getPlayListInfo(link);
    if (!success) return {reply: result, success };

    const { playListInfo } = result;
    for (let i = 0; i < playListInfo.videos.length; i++) {
        const video = playListInfo.videos[i];

        await play(video.url);

        // const { result, success } = await getSongInfo(video.url);
        // if (!success) return {reply: result, success };

        // const { songInfo, embed } = result;

        // await playSongInfo(songInfo, embed);
    }

    return {reply: { content: 'Added playlist!' }, success: true };
}

async function playSongInfo(songInfo, embed, insert = false, skip = false) {
    let stream;
    try {
        stream = await playdl.stream_from_info(songInfo);
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

    if (player.state.status == AudioPlayerStatus.Idle){
        playNext(false)
    } else if (skip) {
        playNext(true);
    }

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

function pause() {
    player.pause();
    return {reply: { content: 'Paused!' }};
}

function resume() {
    player.unpause();
    return {reply: { content: 'Resumed!' }};
}

// Helper functions
async function playNext(skip = true) {
    if (skip) queueArray.shift();

    if (queueArray.length > 0) {
        const next = queueArray[0];
        player.play(next.resource);
        ChannelController.activate();
    } else {
        player.stop();
        ChannelController.deactivate();
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
    if (player) {
        ChannelController.getConnection().subscribe(player);
        return;
    }

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
    if (!link) return {result: { content: 'No link provided!', ephemeral: true }, success: false};

    const regexYT = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/;
    const regexSP = /(?:https?:\/\/)?(?:open\.)?(?:spotify\.com)\/(?:track)\/(.+)/;
    var songInfo;
    if (regexYT.test(link)) {
        try {
            songInfo = await playdl.video_info(link);
        } catch (error) {
            return {result: { content: 'Failed to get link!', ephemeral: true }, success: false};
        }
        const embed = createEmbedMessage(songInfo.video_details);

        return {result: { songInfo, embed }, success: true};
    } else if (regexSP.test(link)) {
        if (playdl.is_expired()) {
            await playdl.refreshToken();
        }

        try {
            songInfo = await playdl.spotify(link, { limit: 1 });
        } catch (error) {
            return {result: { content: 'Failed to get link!', ephemeral: true }, success: false};
        }
        songInfo = songInfo[0];
        const embed = createEmbedMessage(songInfo.video_details);

        return {result: { songInfo, embed }, success: true};
    } else {
        try {
            songInfo = await playdl.search(link, {
                limit: 1
            });
            songInfo = songInfo[0].url;
            songInfo = await playdl.video_info(songInfo);
        } catch (error) {
            return {result: { content: 'Failed to get link!', ephemeral: true }, success: false};
        }
        const embed = createEmbedMessage(songInfo.video_details);

        return {result: { songInfo, embed }, success: true};
    }
}

async function getPlayListInfo(link) {
    if (!link) return {result: { content: 'No link provided!', ephemeral: true }, success: false};

    const regexYT = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:playlist\?list=)?(.+)/;
    var playListInfo;
    if (regexYT.test(link)) {
        try {
            playListInfo = await playdl.playlist_info(link);
        } catch (error) {
            return {result: { content: 'Failed to get link!', ephemeral: true }, success: false};
        }

        return {result: { playListInfo }, success: true};
    } else {
        return {result: { content: 'Invalid link!', ephemeral: true }, success: false};
    }
}

const SongController = {
    play,
    playlist,
    skip,
    stop,
    showQueue,
    remove,
    pause,
    resume
};

export default SongController;