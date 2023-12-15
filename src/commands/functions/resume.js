import ChannelController from "../../channel/ChannelController.js";
import SongController from "../../songs/SongController.js";

export async function resume(channel) {
    if (!channel) return { content: 'You must be in a voice channel to use this command.' };

    ChannelController.checkAndJoin(channel);

    const result = await SongController.resume();
    return result.reply;
}