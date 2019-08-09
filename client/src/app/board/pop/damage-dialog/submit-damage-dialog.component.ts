import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { RuleSetService } from '../../../data-services/ruleSet.service';
import { RulesConfigService } from '../../../data-services/rules-config.service';
import { DamageData } from '../../../../../../shared/types/rule-set/damage.data';
import { DamageTypeData } from "../../../../../../shared/types/rule-set/damage-type.data";
import { FormControl } from "@angular/forms";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { isUndefined } from "util";

@Component({
	templateUrl: 'submit-damage-dialog.component.html',
	styleUrls: ['submit-damage-dialog.component.scss']
})
export class SubmitDamageDialogComponent implements OnInit {
	public damages: DamageData[];
	public formControls: FormControl[];
	public filteredDamageTypes: Observable<DamageTypeData[]>[];

	constructor(private dialogRef: MatDialogRef<SubmitDamageDialogComponent>,
	            public ruleSetService: RuleSetService,
	            public rulesConfigService: RulesConfigService) {
	}

	public ngOnInit(): void {
		this.formControls = [];
		this.damages = [];
		this.filteredDamageTypes = [];
		this.addDamageRow();
	}

	public selectDamageType(type: DamageTypeData, index: number): void {
		this.damages[index].type = type;
		this.formControls[index].setValue(type.name);
	}

	public addDamageRow(): void {
		const formControl = new FormControl();
		const filtered = formControl.valueChanges.pipe(
				startWith(''),
				map((damageTypeName: string) => {
					if (typeof damageTypeName !== 'string') {
						return [];
					}
					return this.filterDamageTypes(damageTypeName);
				})
		);

		this.formControls.push(new FormControl());
		this.filteredDamageTypes.push(filtered);
		this.damages.push({amount: null});
	}

	public removeDamageRow(): void {
		this.formControls.splice(this.formControls.length - 1);
		this.damages.splice(this.damages.length - 1);
	}

	public submit(): void {
		for (let damage of this.damages) {
			if (damage.amount === 0) {
				this.damages.splice(this.damages.indexOf(damage), 1);
			}
		}
		this.dialogRef.close(this.damages);
	}

	private filterDamageTypes(value: string): DamageTypeData[] {
		if (isUndefined(value)) {
			value = '';
		}
		const filterValue: string = value.trim().toLowerCase();
		return this.ruleSetService.damageTypes.filter((type: DamageTypeData) => {
			return (type.name.trim().toLowerCase().indexOf(filterValue) === 0);
		});
	}
}
