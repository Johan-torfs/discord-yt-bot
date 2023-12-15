import ChannelController from "../../channel/ChannelController";

export function join(channel) {
    return ChannelController.joinChannel(channel).reply;
}