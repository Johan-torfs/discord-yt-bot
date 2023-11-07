import { createAudioPlayer, getVoiceConnection, createAudioResource, AudioPlayerStatus } from '@discordjs/voice';
import { EmbedBuilder } from 'discord.js';
import { joinChannel } from './join.js';

import ytdl from 'ytdl-core';

var player;
var queueArray = [];

export async function play(interaction) {
    var connection = getVoiceConnection(interaction.guildId);

    if (!connection) {
        if (!interaction.member.voice?.channel) {
            interaction.reply({content: 'Not connected!' });
            return;
        } else {
            connection = joinChannel(interaction.member.voice?.channel);
        }
    }

    await createPlayer();
    connection.subscribe(player);

    interaction.deferReply({ ephemeral: true });
    const songInfo = await ytdl.getInfo(interaction.options.getString('link'));
    const embed = createEmbedMessage(songInfo.videoDetails);
    interaction.followUp({ embeds: [embed] });

    const audioResource = createAudioResource(ytdl.downloadFromInfo(songInfo, { filter: 'audioonly' }));
    queueArray.push({ resource: audioResource, info: songInfo.videoDetails, embed: embed });
    if (player.state.status == AudioPlayerStatus.Idle) playNext(false);
}

export function skip(interaction) {
    const connection = getVoiceConnection(interaction.guildId);
    if (!connection) {
        interaction.reply({ content: 'Not connected!' });
        return;
    };

    playNext();
    interaction.reply({ content: 'Skipped!' });
}

export async function stop(interaction) {
    const connection = getVoiceConnection(interaction.guildId);
    if (!connection) {
        interaction.reply({ content: 'Not connected!' });
        return;
    };

    player.stop();
    queueArray = [];
    interaction.reply({ content: 'Stopped!' });
}

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
        .setDescription('Duration: ' + Math.floor(details.lengthSeconds / 60) + ':' + ('00' + details.lengthSeconds % 60).slice(-2))
        .setURL(details.video_url)
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