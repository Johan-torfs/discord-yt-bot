import SongController from "../../songs/SongController";

export function skip(channel) {
    if (!channel) return { content: 'You must be in a voice channel to use this command.' };

    return SongController.skip().reply;
}