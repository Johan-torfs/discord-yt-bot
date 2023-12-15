import SongController from "../../songs/SongController";

export function remove(channel, id) {
    if (!channel) return { content: 'You must be in a voice channel to use this command.' };

    return SongController.remove(id).reply;
}