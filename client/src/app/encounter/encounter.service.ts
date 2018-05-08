import { Injectable } from "@angular/core";
import { IsReadyService } from "../utilities/services/isReady.service";
import { EncounterRepository } from "../repositories/encounter.repository";

@Injectable()
export class EncounterService extends IsReadyService {
    private encounterId: string;
    public encounter: any;

    constructor(private encounterRepo: EncounterRepository) {
        super();
    }

    public init(): void {
        this.encounter = {};
        this.encounterRepo.getEncounter(this.encounterId).subscribe((encounter: any) => {
            this.encounter = encounter;
            this.setReady(true);
        });
    }

    public setEncounterId(id: string): void {
        this.encounterId = id;
        this.setReady(false);
        this.init();
    }
}