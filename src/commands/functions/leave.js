import ChannelController from "../../channel/ChannelController.js";

export function leave() {
    return ChannelController.leave().reply;
}