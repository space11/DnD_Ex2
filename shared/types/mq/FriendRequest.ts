import { MqMessageType } from './message-type.enum';
import { MqMessage } from './MqMessage';

export interface FriendRequest extends MqMessage {
	headers: {
		type: MqMessageType.FRIEND_REQUEST,
		from: String,
		to: String,
	}
}