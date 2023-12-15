import ChannelController from "../../channel/ChannelController";

export function leave() {
    return ChannelController.leave().reply;
}