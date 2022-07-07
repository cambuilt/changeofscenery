import { Injectable } from '@angular/core';
// import { Headers } from '@angular/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
	providedIn: 'root'
})
export class ResourcesService {
	private url = 'https://bhg.azurewebsites.net/TreasureMaps';
	private httpOptions = { headers: new HttpHeaders({'Content-Type': 'application/json;charset=UTF-8'})};
	treasureMaps: any;
	gems: any;

	constructor(private http: HttpClient) { 
	}

	getTreasureMaps() {
		return this.http.get("assets/treasureMaps.json");
	}

	getGems(cityName) {
		return this.http.get("assets/" + cityName + "/" + cityName + ".json");
	}

	getIcons() {
		return this.http.get("assets/icons.json");
	}

	getRouteLines() {
		return this.http.get("assets/routeLines.json");
	}

	getTreasureMapById(id) {
		return this.http.get(`${this.url}/${id}`);
	}

	createGem(treasureMapId: string, newGem: string) {
		return this.http.post<string>(`${this.url}/${treasureMapId}/gems`, newGem, this.httpOptions).toPromise();
	}

	updateGem(gemId: string, updatedGem: string) {
		this.http.put(`${this.url}/gems/${gemId}`, updatedGem, this.httpOptions).subscribe(response => {
			// console.log('updated gem');
		}, error => {
			console.log(`Error updating gem: ${error}`);
			console.log(`${this.url}/gems/${gemId}`);
			console.log(updatedGem);
		});
	}

	deleteGem(gemId: string) {
		this.http.delete(`${this.url}/gems/${gemId}`, this.httpOptions).subscribe(response => {
			console.log('deleted gem');
		}, error => {
			console.log(`Error deleting gem: ${error}`);
		});
	}

	getGemByLatLng(latLng: string) {
		return this.http.get(`${this.url}/gems/latlng/${latLng}`);
	}

	createRouteLine(treasureMapId: string, newRouteLine: string) {
		return this.http.post(`${this.url}/${treasureMapId}/routeLines`, newRouteLine, this.httpOptions).toPromise();
	}

	createIcon(newIcon: string) {
		console.log(`${this.url}/icons`, newIcon);
		return this.http.post(`${this.url}/icons`, newIcon, this.httpOptions).toPromise();
	}

}
