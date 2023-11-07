import { getVoiceConnection } from '@discordjs/voice';

export async function leave(interaction) {
    const connection = getVoiceConnection(interaction.guildId);
    if (!connection) {
        interaction.reply({content: 'Not connected!' });
        return;
    };

    connection.destroy();
    interaction.reply({content: 'Left!' });
}
