import { getVoiceConnection, joinVoiceChannel, VoiceConnectionStatus } from "@discordjs/voice";

var activeChannel;
var active = false;

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

    connection.on(VoiceConnectionStatus.Ready, startTimeout);

    connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
        try {
            await Promise.race([
                entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
            ]);
        } catch (error) {
            connection.destroy();
            activeChannel = null;
            active = false;
        }
    });

    activeChannel = channel;
    return {reply: {content: 'Connected!'}, success: true };
}

function startTimeout() {
    setTimeout(() => {
        if (!active) {
            setTimeout(() => {
                if (!active) {
                    getConnection().destroy();
                    activeChannel = null;
                    active = false;
                } else {
                    startTimeout();
                }
            }, 1000 * 60 * 5);
        } else {
            startTimeout();
        }
    }, 1000 * 20);
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
    active = false;
    return {reply: {content: 'Left!' }};
}

function activate() {
    active = true;
}

function deactivate() {
    active = false;
}

const ChannelController = {
    checkAndJoin,
    joinChannel,
    leave,
    getConnection,
    activate,
    deactivate,
}

export default ChannelController;