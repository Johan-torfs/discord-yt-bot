import ChannelController from "../../channel/ChannelController.js";

export function join(channel) {
    return ChannelController.joinChannel(channel).reply;
}