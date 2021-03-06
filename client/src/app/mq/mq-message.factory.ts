import { MqMessageType } from '../../../../shared/types/mq/message-type.enum';
import { FriendRequestMessage } from './messages/friend-request.message';
import { AcceptFriendRequest } from './messages/friend-request-accepted.message';
import { CampaignInviteMessage } from './messages/campaign-invite.message';
import { EncounterCommandType } from '../../../../shared/types/encounter/encounter-command.enum';
import { EncounterCommandMessage } from './messages/encounter-command.message';

export class MqMessageFactory {
	public static createFriendRequest(toUserId: string, fromUserId: string): FriendRequestMessage {
		return new FriendRequestMessage({
			headers: {
				type: MqMessageType.FRIEND_REQUEST,
				fromUserId: fromUserId,
				toUserId: toUserId
			}
		});
	}

	public static createAcceptFriendRequestMessage(toUserId): AcceptFriendRequest {
		return new AcceptFriendRequest({
			headers: {
				type: MqMessageType.FRIEND_REQUEST_ACCEPTED,
				toUserId: toUserId
			}
		});
	}

	public static createCampaignInvite(toUserId: string, campaignId: string): CampaignInviteMessage {
		return new CampaignInviteMessage({
			headers: {
				type: MqMessageType.CAMPAIGN_INVITE,
				toUserId: toUserId,
				campaignId: campaignId
			}
		});
	}

	public static createEncounterUpdate(version: number, userId: string, encounterId: string, dataType: EncounterCommandType, data: {}): EncounterCommandMessage {
		return new EncounterCommandMessage({
			headers: {
				type: MqMessageType.ENCOUNTER,
				encounterId: encounterId
			},
			body: JSON.stringify({
				userId: userId,
				version: version,
				dataType: dataType,
				data: data
			})
		});
	}
}