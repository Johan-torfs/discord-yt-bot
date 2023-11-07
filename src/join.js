import { joinVoiceChannel } from "@discordjs/voice";

export async function join(interaction) {
    const channel = interaction.options.getChannel('channel');
    if (!channel) return;

    joinChannel(channel);

    interaction.reply({content: 'Joined!' });
}

export function joinChannel(channel) {
    return joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });
}