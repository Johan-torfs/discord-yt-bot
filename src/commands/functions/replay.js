import ChannelController from "../../channel/ChannelController.js";
import SongController from "../../songs/SongController.js";

export async function replay(channel, embeds) {
    if (!channel) return { content: 'You must be in a voice channel to use this command.' };
    
    ChannelController.checkAndJoin(channel);

    if (embeds.length == 0) return {content: 'No song in this message!', ephemeral: true };

    const embed = embeds[0];
    if (!embed.url) return {content: 'No song in this message!', ephemeral: true };

    const result = await SongController.play(embed.url);
    return result.reply;
}