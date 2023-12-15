import { getVoiceConnection, joinVoiceChannel } from "@discordjs/voice";

var activeChannel;

var getConnection = () => {
    if (!activeChannel) return null;
    return getVoiceConnection(activeChannel.guild.id);
};

function joinChannel(channel) {
    if (!channel) return {reply: {content: 'Invalid channel!'}, success: false };
    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });

    connection.on(VoiceConnectionStatus.Ready, () => {
        setTimeout(() => {
            if (!activeChannel) connection.destroy();
        }, 1000 * 60 * 5);
    });

    connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
        try {
            await Promise.race([
                entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
            ]);
        } catch (error) {
            connection.destroy();
            activeChannel = null;
        }
    });

    activeChannel = channel;
    return {reply: {content: 'Connected!'}, success: true };
}

async function checkAndJoin(channel) {
    if (getConnection()) {
        return true;
    }

    return joinChannel(channel).success;
}

function leave() {
    if (!getConnection()) {
        return {reply: {content: 'Not connected!' }};
    };

    getConnection().destroy();
    activeChannel = null;
    return {reply: {content: 'Left!' }};
}

export default ChannelController = {
    checkAndJoin,
    joinChannel,
    leave,
    getConnection,
}