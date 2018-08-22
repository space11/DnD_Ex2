import { Injectable } from '@angular/core';
import { IsReadyService } from '../utilities/services/isReady.service';
import { EncounterRepository } from '../repositories/encounter.repository';
import { Player } from './player';
import { Observable } from "rxjs";
import { EncounterState } from './encounter.state';
import { BoardStateService } from '../board/services/board-state.service';
import { EncounterData } from '../../../../shared/types/encounter/encounter.data';
import { CharacterData } from '../../../../shared/types/character.data';

@Injectable()
export class EncounterService extends IsReadyService {
	protected claimedPlayerId: string;
	protected hasClaimedPlayer = false;

	private encounterId: string;
	public encounterState: EncounterState;

	constructor(
			protected boardStateService: BoardStateService,
			protected encounterRepo: EncounterRepository,
	) {
		super();
	}

	public init(): void {
		this.encounterRepo.getEncounter(this.encounterId).subscribe((encounter: EncounterData) => {
			this.encounterState = new EncounterState(encounter);
			this.setReady(true);
		});
	}

	public setEncounterId(id: string): void {
		this.encounterId = id;
		this.setReady(false);
		this.init();
	}

	public init_players() {

	};

	public addPlayer(player: Player): void {
		this.encounterState.players.push(player);
	}

	public addCharacters(characters: CharacterData[]): Observable<void> {
		return this.encounterRepo.addCharacters(this.encounterId, characters);
	}

	public getPlayerById(id: string): Player {
		for (const player of this.players) {
			if (player.id === id) {
				return player;
			}
		}
	}

	get players(): Player[] {
		if (this.encounterState) {
			return this.encounterState.players as Player[];
		}
		return [];
	}

	public getAspectValue(playerId: string, aspectLabel: string): any {
		return this.encounterState.getAspectValue(playerId, aspectLabel);
	}
}