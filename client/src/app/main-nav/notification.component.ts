import { Component } from "@angular/core";
import { UserProfile } from "../types/userProfile";
import { SocialService } from "../social/social.service";
import { NotificationsService } from "../utilities/services/notifications.service";
import { UserProfileService } from "../utilities/services/userProfile.service";
import { NotificationType } from '../../../../shared/types/notification-type';
import { NotificationData } from '../../../../shared/types/notification-data';
import { CampaignInviteNotification } from '../../../../shared/types/campaign-invite-notification';

@Component({
    selector: 'app-notifications',
    templateUrl: 'notification.component.html',
    styleUrls: []
})
export class NotificationComponent {
    public notificationType = NotificationType;

    constructor(private socialService: SocialService,
                public notificationsService: NotificationsService,
                private profileService: UserProfileService) {

    }

    public acceptRequest(requester: UserProfile): void {
        this.socialService.acceptRequest(requester._id);
        this.notificationsService.removeFriendRequest(requester._id);
        this.profileService.getFriends();
    }

    public rejectRequest(requester: UserProfile): void {
        this.socialService.rejectFriendRequest(requester._id);
        this.notificationsService.removeFriendRequest(requester._id);
    }

    public acceptCampaignInvite(notificationData: NotificationData): void {
        this.notificationsService.notifications.splice(this.notificationsService.notifications.indexOf(notificationData), 1);
        let campaignData = notificationData as CampaignInviteNotification;
        this.notificationsService.joinCampaign(campaignData.campaignId);
    }

    public rejectCampaignInvite(notificationData: NotificationData): void {
        let campaignData = notificationData as CampaignInviteNotification;
    }
}