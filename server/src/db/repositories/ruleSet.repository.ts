import * as mongoose from 'mongoose';
import { RuleSetModel } from '../models/ruleSet.model';

export class RuleSetRepository {
	private RuleSet: mongoose.Model<mongoose.Document>;

	constructor() {
		this.RuleSet = mongoose.model('RuleSet');
	}

	public create(label: string): Promise<RuleSetModel> {
		return new Promise((resolve, reject) => {
			this.RuleSet.create({
				label: label
			}, (error, newRuleSet: RuleSetModel) => {
				if (error) {
					reject(error);
					return;
				}

				resolve(newRuleSet);
			});
		});
	}

	public findById(id: string): Promise<RuleSetModel> {
		return new Promise((resolve, reject) => {
			this.RuleSet.findById(id, (error, ruleSet: RuleSetModel) => {
				if (error) {
					reject(error);
					return;
				}

				resolve(ruleSet);
			})
		});
	}

	public deleteById(id: string): Promise<void> {
		return new Promise((resolve, reject) => {
			this.RuleSet.remove({_id: id}, (error) => {
				if (error) {
					reject(error);
					return;
				}

				resolve();
			});
		});
	}

	public getAdmins(ruleSetId: string): Promise<any[]> {
		return new Promise((resolve, reject) => {
			// this.findById(ruleSetId).then((ruleSet: RuleSetModel) => {
			//     let admins: any[] = [];
			//     let adminCount = ruleSet.admins.length;
			//     ruleSet.admins.forEach((admin: any) => {
			//         this.userRepository.findById(admin.userId).then((user: UserModel) => {
			//              admins.push({username: user.username, role: admin.role});
			//              if (--adminCount === 0) {
			//                  resolve(admins);
			//              }
			//         });
			//     });
			// }).catch(error => reject(error));
			resolve();
		});
	}
}