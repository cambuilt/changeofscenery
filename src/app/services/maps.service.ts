import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Location {
	name: string;
	description: string;
	address: string;
	latitude: string;
	longitude: string;
	notes: string;
	imageUrl: string;
}

@Injectable({
	providedIn: 'root'
})
export class MapsService {
	foodTour: any;
	static cacheIndex = 0
	static cacheEnd = 0;

	constructor(private http: HttpClient) { }

	getLocation() {
		return this.http.get<Location>('https://ipapi.co/json/');
	}

	getCurrentLocationData(latlng) {
		return this.http.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latlng}&key=AIzaSyC8S_iM_T1L-gZ5rWhme8H6ri5lBry56Js`);
	}
}
