import { Injectable } from '@angular/core';
import { SocialRepository } from './social.repository';
import { Observable } from 'rxjs/Observable';
import { UserProfile } from '../types/userProfile';

@Injectable()
export class SocialService {
    constructor(private socialRepo: SocialRepository) {}

    public findUsers(criteria: string): Observable<any> {
        return this.socialRepo.findUsers(criteria);
    }

    public sendFriendRequest(toUserId: string): void {
        this.socialRepo.sendFriendRequest(toUserId);
    }

    public acceptRequest(fromUserId: string): void {
        this.socialRepo.acceptRequest(fromUserId);
    }

    public rejectFriendRequest(fromUserId: string): void {
        this.socialRepo.rejectFriendRequest(fromUserId);
    }

    public getPendingFriendRequests(): Observable<UserProfile[]> {
        return this.socialRepo.getPendingFriendRequests();
    }

    public getFriends(): Observable<UserProfile[]> {
        return this.socialRepo.getFriends();
    }
}