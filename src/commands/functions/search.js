import ChannelController from "../../channel/ChannelController.js";
import SongController from "../../songs/SongController.js";

export async function search(channel, query) {
    if (!channel) return { content: 'You must be in a voice channel to use this command.' };

    ChannelController.checkAndJoin(channel);

    const result = await SongController.play(query);
    return result.reply;
}