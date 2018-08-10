import { Aspect } from '../../types/character-sheet/aspect';
import { SubComponent } from './subcomponents/sub-component';
import { CharacterSheetData } from '../../../../../shared/types/character-sheet.data';


export interface CharacterInterfaceService {
	immutable: boolean;

	characterSheet: CharacterSheetData;

	init(): void;

	registerSubComponent(subComponent: SubComponent): void;

	valueOfAspect(aspect: Aspect): any;

	getValueOfAspectByLabel(label: string): any;

	updateFunctionAspects(): void;

	getGridHeight(): number;
}