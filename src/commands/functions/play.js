import ChannelController from "../../channel/ChannelController";
import SongController from "../../songs/SongController";

export function play(channel, songLink) {
    if (!channel) return { content: 'You must be in a voice channel to use this command.' };
    
    ChannelController.checkAndJoin(channel);

    return SongController.play(songLink).reply;
}