export class Site {
	id: number;
	Name: string;
	Description: string;
	Notes: string;

	constructor(values?: any) {
		if (values) {
			Object.keys(values).forEach(key => {
				this[key] = values[key];
			});
		}
	}
}
