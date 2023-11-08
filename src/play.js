import { createAudioPlayer, getVoiceConnection, createAudioResource, AudioPlayerStatus } from '@discordjs/voice';
import { EmbedBuilder } from 'discord.js';
import { joinChannel } from './join.js';

import play from 'play-dl';

var player;
var queueArray = [];
var nextId = 1;

export async function playCommand(interaction) {
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

    interaction.deferReply();
    const songInfo = await play.video_info(interaction.options.getString('link'));
    const embed = createEmbedMessage(songInfo.video_details);
    interaction.followUp({ embeds: [embed] });

    let stream = await play.stream_from_info(songInfo)
    let resource = createAudioResource(stream.stream, {
        inputType: stream.type
    })

    queueArray.push({ resource: resource, info: {...songInfo.video_details, id: ++nextId}, embed: embed });
    if (player.state.status == AudioPlayerStatus.Idle) playNext(false);
}

export function skipCommand(interaction) {
    const connection = getVoiceConnection(interaction.guildId);
    if (!connection) {
        interaction.reply({ content: 'Not connected!' });
        return;
    };

    playNext();
    interaction.reply({ content: 'Skipped!' });
}

export async function stopCommand(interaction) {
    const connection = getVoiceConnection(interaction.guildId);
    if (!connection) {
        interaction.reply({ content: 'Not connected!' });
        return;
    };

    player.stop();
    queueArray = [];
    interaction.reply({ content: 'Stopped!' });
}

export async function queueCommand(interaction) {
    const connection = getVoiceConnection(interaction.guildId);
    if (!connection) {
        interaction.reply({ content: 'Not connected!' });
        return;
    };
    
    interaction.reply({ content: 'Queue: ' + queueArray.map((item) => item.info.id + '. ' + item.info.title).join('\n') });
}

export async function removeCommand(interaction) {
    const connection = getVoiceConnection(interaction.guildId);
    if (!connection) {
        interaction.reply({ content: 'Not connected!' });
        return;
    };

    const id = interaction.options.getInteger('id');
    const index = queueArray.findIndex((item) => item.info.id == id);
    if (index == -1) {
        interaction.reply({ content: 'Not found!' });
        return;
    }

    queueArray.splice(index, 1);
    interaction.reply({ content: 'Removed!' });
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