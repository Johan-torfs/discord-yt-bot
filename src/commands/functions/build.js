import ChannelController from "../../channel/ChannelController.js";
import SongController from "../../songs/SongController.js";

export async function build(channel, songLink) {
    if (!channel) return { content: 'You must be in a voice channel to use this command.' };
    
    ChannelController.checkAndJoin(channel);

    const result = await SongController.play(songLink, true, true);
    return result.reply;
}