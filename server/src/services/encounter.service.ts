import { EncounterRepository } from "../db/repositories/encounter.repository";
import { EncounterModel } from "../db/models/encounter.model";
import { PlayerRepository } from "../db/repositories/player.repository";
import { EncounterData } from '../../../shared/types/encounter/encounter.data';
import { CharacterData } from '../../../shared/types/character.data';
import { CharacterService } from './character.service';
import { CharacterSheetRepository } from '../db/repositories/characterSheet.repository';
import { MqServiceSingleton } from '../mq/mq.service';
import { EncounterCommandType } from '../../../shared/types/encounter/encounter-command.enum';
import { PlayerData } from '../../../shared/types/encounter/player.data';

export class EncounterService {
	private encounterRepo: EncounterRepository;
	private playerRepo: PlayerRepository;
	private characterSheetRepo: CharacterSheetRepository;
	private characterService: CharacterService;

	constructor() {
		this.encounterRepo = new EncounterRepository();
		this.playerRepo = new PlayerRepository();
		this.characterSheetRepo = new CharacterSheetRepository();
		this.characterService = new CharacterService();
	}

	public async create(hostId: string, label: string, campaignId: string, mapDimX: number, mapDimY: number, mapUrl?: string): Promise<EncounterModel> {
		try {
			let encounterModel: EncounterModel = await this.encounterRepo.create(label, campaignId, mapDimX, mapDimY);
			await encounterModel.addGameMaster(hostId);
			if (mapUrl) {
				encounterModel = await encounterModel.setMapUrl(mapUrl);
			}

			return encounterModel;
		}
		catch (error) {
			throw error;
		}
	}

	public async getEncounter(encounterId: string): Promise<EncounterData> {
		try {
			const encounter = await this.encounterRepo.findById(encounterId);
			const encounterState = await this.buildEncounterState(encounter);
			return encounterState;
		}
		catch (error) {
			throw error;
		}
	}

	public async setEncounter(encounterData: EncounterData): Promise<EncounterModel> {
		try {
			const encounterModel = await this.encounterRepo.findById(encounterData._id);
			return await encounterModel.setEncounterState(encounterData);
		}
		catch (error) {
			throw error;
		}
	}

	public getAllForCampaignId(campaignId: string): Promise<EncounterModel[]> {
		return new Promise<EncounterModel[]>((resolve, reject) => {
			this.encounterRepo.findByCampaignId(campaignId).then((encounters: EncounterModel[]) => {
				resolve(encounters);
			}).catch(error => reject(error));
		});
	}

	public async addCharacters(encounterId: string, userId: string, characters: CharacterData[]): Promise<void> {
		try {
			let encounter: EncounterModel = await this.encounterRepo.findById(encounterId);
			for (let character of characters) {
				let player = await this.playerRepo.create(encounterId, character);
				await encounter.addPlayer(player);
				player.characterData.characterSheet = await this.characterSheetRepo.findById(player.characterData.characterSheetId);
				await MqServiceSingleton.sendEncounterCommand(encounterId, userId, EncounterCommandType.ADD_PLAYER, player);
			}

			return;
		}
		catch (error) {
			throw error;
		}
	}

	public async deleteEncounter(encounterId: string): Promise<void> {
		try {
			const encounter: EncounterModel = await this.encounterRepo.findById(encounterId);
			if (encounter.playerIds) {
				for (let playerId of encounter.playerIds) {
					await this.playerRepo.deleteById(playerId);
				}
			}
			await this.encounterRepo.deleteById(encounterId);
			return;
		}
		catch (error) {
			throw error;
		}
	}

	public async updateEncounterOpenStatus(encounterId: string, isOpen: boolean): Promise<EncounterModel> {
		try {
			const encounter = await this.encounterRepo.findById(encounterId);
			return await encounter.setIsOpen(isOpen);
		}
		catch (error) {
			throw error;
		}
	}

	public async deletePlayer(player: PlayerData, userId: string): Promise<void> {
		try {
			const encounter: EncounterModel = await this.encounterRepo.findById(player.encounterId);
			await encounter.removePlayer(player);
			await this.playerRepo.deleteById(player._id);
			await MqServiceSingleton.sendEncounterCommand(player.encounterId, userId, EncounterCommandType.REMOVE_PLAYER, player);
			return;
		}
		catch (error) {
			throw error;
		}
	}

	private async buildEncounterState(encounterModel: EncounterModel): Promise<EncounterData> {
		let encounterState: EncounterData = JSON.parse(JSON.stringify(encounterModel));
		encounterState.players = [];
		for (let playerId of encounterModel.playerIds) {
			const playerData = await this.playerRepo.findById(playerId);
			playerData.characterData.characterSheet = await this.characterSheetRepo.findById(playerData.characterData.characterSheetId);
			encounterState.players.push(playerData);
		}
		delete encounterState['playerIds'];
		return encounterState;
	}
}