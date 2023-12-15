import SongController from "../../songs/SongController";

export function queue(channel) {
    if (!channel) return { content: 'You must be in a voice channel to use this command.' };

    return SongController.showQueue().reply;
}