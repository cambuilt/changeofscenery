import { Component, OnInit } from '@angular/core';
import { ResourcesService } from '../services/resources.service';
import * as $ from 'jquery';

declare var mapkit;

@Component({
  selector: 'bhg-charleston',
  templateUrl: './charleston.component.html',
  styleUrls: ['./charleston.component.css']
})

export class CharlestonComponent implements OnInit {
	maps: any;
	gems: any = [];
	lastWidth = 0;
	lastHeight = 0;
	lastCameraDistance = 0.0;
	regionChangeCounter = 0;
	attractionMarkers: any = [];
	public currentMap = {Id: '', Name: '', Area: '', Author: '', Latitude: 0, Longitude: 0, Website: '', Zoom: 8, Comments: ''};
	currentAttraction = { Title: '', Subtitle: '', Latitude: 0, Longitude: 0, GlyphImage: '', CameraDistancePortrait: 0, CameraDistanceLandscape: 0, Rotation: 0};

  	constructor(private resourcesService: ResourcesService) { }

  	ngOnInit(): void {
		let token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiIsImtpZCI6Ik5OSjY3QVRLNDgifQ.eyJpc3MiOiI2WTU3UVY0Tlc1IiwiZXhwIjoxNjU1OTQ1NDk2LjA5NzE4NywiaWF0IjoxNjI0NDk1ODk2LjA5NzE5Mn0.DO9jhQDhieQQnu332XQ6quaQ-YP9VIPpiw_z334EaM4AsQRbm4UZ8rO4i_vEXqec7dcG86CR2wSVQns25F-76w';
		
		mapkit.init({
			authorizationCallback: done => {		  
			  done(token);		  
			},
			language: "en-US"
		});

		var appleMap, selectedRegionLatitide, selectedRegionLongitude;
		var selectingAttraction = false;

		this.resourcesService.getTreasureMaps().subscribe(treasureMaps => {
			this.maps = (treasureMaps.valueOf() as JSON);
			this.currentMap = this.maps.find(treasureMap => treasureMap.Name === 'Rainbow Row');

			appleMap = new mapkit.Map('apple_map');
			appleMap.visibleMapRect = new mapkit.MapRect(0, 0, 1200, 1200);
			appleMap.pitchEnabled = true;
			appleMap.showsUserLocation = true;
			appleMap.showsUserLocationControl = true;
			appleMap.rotation = 0;
			appleMap.showsPointsOfInterest = false;
			appleMap.showsCompass = mapkit.FeatureVisibility.Visible;
			appleMap.mapType = mapkit.Map.MapTypes.Standard;
			appleMap.showsMapTypeControl = false;
	
			appleMap.addEventListener('select', event => {
				if (event.annotation.data == 'attraction') {
					this.regionChangeCounter = 0;
					$('#mapTitle')[0].hidden = true;
					$('#mapCharleston')[0].hidden = true;
					$('#mapLogo')[0].hidden = true;
					selectingAttraction = true;
					this.currentAttraction = this.attractionMarkers.find(marker => marker.Title == event.annotation.title);
					selectedRegionLatitide = event.annotation._impl._coordinate.latitude;
					selectedRegionLongitude = event.annotation._impl._coordinate.longitude + 0.0001;
					if (document.body.clientWidth > 400) {
						selectedRegionLongitude -= 0.000085;
					}					
					appleMap.setCenterAnimated(new mapkit.Coordinate(selectedRegionLatitide, selectedRegionLongitude)); 
					var distance = 70;
					if (document.body.clientWidth < 400) {						
						distance = this.currentAttraction.CameraDistancePortrait;
					} else {
						distance = this.currentAttraction.CameraDistanceLandscape;
					}					
					let rotation = this.currentAttraction.Rotation;
					setTimeout(function() {appleMap.setCameraDistanceAnimated(distance);}, 300);
					setTimeout(function() {appleMap.setRotationAnimated(rotation);}, 700);
					setTimeout(function() {selectingAttraction = false;}, 1200);					
				}
			});		

			this.attractionMarkers.push({Title: "Rainbow Row", Subtitle: "<div style='margin-right:10px;'><span style='font-family:Trattatello;font-size: 32px;'>B</span>uilt before the American Revolution and painted with the iconic pastel colors in the 1920s. Most owners operated their business on the first floor and lived with their families on the upper floors. The residence part of the house could only be accessed from the back.</div>", Latitude: "32.7756961105889", Longitude: "-79.9274120588608", GlyphImage: "RainbowRow.png", CameraDistancePortrait: 40, CameraDistanceLandscape: 70, Rotation: 84, Width: 130});
			this.attractionMarkers.push({Title: "E Bay St", Subtitle: "<div style='margin-right:10px;'><span style='font-family:Trattatello;font-size: 32px;'>F</span>ine examples of the <a href='https://en.wikipedia.org/wiki/Charleston_single_house' target='_blank'>Charleston Single House</a>, so-named because the side facing the street is one room wide. Originally built without <a href='https://www.southernliving.com/home-garden/decorating/charleston-home-porch?slide=c1f8cfc0-9372-4196-ab38-c1c020fd8ac5#c1f8cfc0-9372-4196-ab38-c1c020fd8ac5' target='_blank'>piazza</a>s, which were added later to help residents cope with the sweltering Charleston summers and were situated to reap maximum benefit from the cooling bay breezes.</div>", Latitude: "32.7738961105889", Longitude: "-79.9276020588608", GlyphImage: "EastBayStreet.png", CameraDistancePortrait: 50, CameraDistanceLandscape: 100, Rotation: 87, Width: 140});
			this.attractionMarkers.push({Title: "East Battery", Subtitle: "<div style='margin-right:10px;'><span style='font-family:Trattatello;font-size: 32px;'>T</span>he southern walled of the Walled City of Charleston was just north of Water Street. Until the wall was removed in the mid 1780s, all land south of the wall was swamp. Since then, grand mansions were built that you see today.", Latitude: "32.7705061105889", Longitude: "-79.9288720588608", GlyphImage: "EastBattery.png", CameraDistancePortrait: 100, CameraDistanceLandscape: 160, Rotation: 70, Width: 120});
			// this.attractionMarkers.push({Title: "White Point Garden", Subtitle: "5.7 acre public park", Latitude: "32.769621105889", Longitude: "-79.9308020588608", GlyphImage: "WhitePointGarden.png", Width: 170});
			this.attractionMarkers.push({Title: "Church St", Subtitle: "<div style='margin-right:10px;'><span style='font-family:Trattatello;font-size: 32px;'>C</span>harming brick cobblestone portion of Church Street that ends at Water Street.", Latitude: "32.772461105889", Longitude: "-79.9297020588608", GlyphImage: "LowerChurchStreet.png", CameraDistancePortrait: 60, CameraDistanceLandscape: 120, Rotation: 90, Width: 170});
			// this.attractionMarkers.push({Title: "Church St", Subtitle: "South of Broad, near Tradd.", Latitude: "32.775061105889", Longitude: "-79.9293020588608", GlyphImage: "MiddleChurchStreet.png", Width: 170});
			// this.attractionMarkers.push({Title: "Meeting St", Subtitle: "South of Broad.", Latitude: "32.774261105889", Longitude: "-79.931000588608", GlyphImage: "MeetingStreet.png", Width: 130});
			
			this.attractionMarkers.forEach(marker => {
				let coordinate = new mapkit.Coordinate(Number(marker.Latitude), Number(marker.Longitude));	

				var calloutDelegateMap = { 
					calloutContentForAnnotation: function() {
						var calloutDiv = document.createElement('div');
						var titleDiv = calloutDiv.appendChild(document.createElement('h1'));
						var subtitleDiv = calloutDiv.appendChild(document.createElement('h2'));
						subtitleDiv.innerHTML = marker.Subtitle;
						calloutDiv.style.height = "100%";
						calloutDiv.style.width = "300px";
						var closeSpan = calloutDiv.appendChild(document.createElement('span'));
						closeSpan.innerHTML = '✕';
						closeSpan.style.color = 'black';
						closeSpan.style.position = 'fixed';
						closeSpan.style.top = '0px';
						closeSpan.style.right = '0px';
						closeSpan.style.fontSize = '20px';
						closeSpan.style.cursor = 'pointer';
						closeSpan.onclick = function() { appleMap.selectedAnnotation = null; }
						return calloutDiv;
					}
				};

				var imageAnnot = new mapkit.ImageAnnotation(coordinate, {
					title: marker.Title,
					url: { 1: `assets/${marker.GlyphImage}`},
					callout: calloutDelegateMap,
					data: 'attraction',
					size: {width: marker.Width, height: 40}
				});
			
				appleMap.addAnnotation(imageAnnot);
			});
			
			appleMap.addEventListener("region-change-start", event => {
				if (this.regionChangeCounter > 2 && this.regionChangeCounter != 100 && appleMap.cameraDistance < 400) {
					appleMap.selectedAnnotation = null;
					appleMap.annotations.forEach(annotation => {							
						if (annotation.data == 'attraction') {
							annotation.visible = false;
						}
					});
					this.regionChangeCounter = 100;
				}
			});

			appleMap.addEventListener("region-change-end", event => {
				if (this.regionChangeCounter != 100) {
					this.regionChangeCounter++;
				}
				let width = event.target._impl._visibleFrame.size.width;
				let height = event.target._impl._visibleFrame.size.height;

				if (this.lastWidth == 0) {
					this.lastWidth = width;
					this.lastHeight = height;		
				}

				let cameraDistance = appleMap.cameraDistance;
				// var minimumAnnotationSeparation = 0;

				// if (cameraDistance > 200 && cameraDistance < 250) {
				// 	minimumAnnotationSeparation = 0;
				// } else if (cameraDistance > 250 && cameraDistance < 300) {
				// 	minimumAnnotationSeparation = 0;
				// } else if (cameraDistance > 300 && cameraDistance < 400) {
				// 	minimumAnnotationSeparation = 0;
				// } else if (cameraDistance > 400 && cameraDistance < 1100) {
				// 	minimumAnnotationSeparation = 0;
				// }

				if (cameraDistance > 2421 || this.lastWidth == width || this.lastHeight == height) {
					// Initial view or device orientation changed.
				} else {
					if (appleMap.visibleMapRect.size.width > 0.0000079) {						
						appleMap.cameraDistance = this.currentAttraction.CameraDistancePortrait;
					} else {
						appleMap.cameraDistance = this.currentAttraction.CameraDistanceLandscape;
					}
				}

				this.lastWidth = width;
				this.lastHeight = height;

				if (appleMap.cameraDistance < 400 || this.regionChangeCounter < 3) {
					appleMap.annotations.forEach(annotation => {							
						if (annotation.data != 'attraction') {
							if (this.regionChangeCounter < 3) {
								annotation.visible = false;
							} else {
								annotation.visible = true;									
							}
						}
					});
				} else if ($('#mapTitle')[0].hidden == true) {
					this.homeView();
				}
			});

			this.resourcesService.getGems('charleston').subscribe(gems => {
				const allGems:any = gems;
				this.gems = allGems.filter(gem => gem.TreasureMapId === this.currentMap.Id);
				this.gems.forEach(gem => {
					if (gem.IconId.indexOf('-') == -1) {
						let coordinate = new mapkit.Coordinate(Number(gem.Latitude), Number(gem.Longitude));
						
						var calloutDelegate = { 
							calloutContentForAnnotation: function() {
								var rowDiv = document.createElement('div');
								rowDiv.classList.add('row');
								var photoDiv = rowDiv.appendChild(document.createElement('div'));
								var photoImg = photoDiv.appendChild(document.createElement('img'));
								var id = gem.Address;
								while (id.indexOf(' ') > -1) {
									id = id.replace(' ', '');
								}
								photoImg.id = id;
								photoImg.src = gem.ImageUrl;
								photoImg.width = 180;
								photoImg.height = 180;
								photoDiv.classList.add('col-6');
								photoDiv.classList.add('photo');
								photoImg.onclick = function() {
									let selector = '#' + photoImg.id;
									if ($(selector).attr('src').indexOf('assets') > -1) {
										$(selector).attr('src', gem.ImageUrl);
									} else {
										$(selector).attr('src', `assets/houses/${gem.IconId}.svg`);
									}
								};
								var textDiv = rowDiv.appendChild(document.createElement('div'));
								textDiv.classList.add('col-6');
								textDiv.classList.add('calloutText');								
								var nameH3 = textDiv.appendChild(document.createElement('h3'));
								var descDiv = textDiv.appendChild(document.createElement('div'));
								var zillowDiv = textDiv.appendChild(document.createElement('div'));
								var notesDiv = textDiv.appendChild(document.createElement('div'));

								if (gem.Name.indexOf(' - ') > -1) {
									nameH3.innerHTML = gem.Name.substr(gem.Name.indexOf(' - ') + 3);
								} else {
									nameH3.innerHTML = gem.Name;
								}

								descDiv.className = 'descriptionTop';
								descDiv.innerHTML = gem.Description;
								
								if (gem.ZillowUrl.length > 0) {
									let left = document.body.clientWidth > 600 ? '-190px;' : '-160px;';
									if (gem.ZillowUrl.indexOf('zillow') > -1) {
										zillowDiv.innerHTML = "<span class='zillow' style='left:" + left + "'>See more details on <a href='" + gem.ZillowUrl + "' target='_blank'><img src='assets/Zillow.png' width=\"50px\" style='padding-bottom:6px;'/></a></span>";
									} else {
										zillowDiv.innerHTML = "<span class='website' style='left:" + left + "'><a href='" + gem.ZillowUrl + "' target='_blank'>Website</a></span>";
									}
								}
								notesDiv.className = 'notes';
								notesDiv.innerHTML = '<span style="font-weight:700">' + gem.Address + '</span><br/>' + gem.Notes;
														
								if (document.body.clientWidth < 400) {
									rowDiv.style.width = "360px";
								} else {
									rowDiv.style.width = "430px";
								}

								rowDiv.style.height = "220px";
								return rowDiv;
							}
						};

						var annot = new mapkit.ImageAnnotation(coordinate, {
							url: { 1: `assets/houses/${gem.IconId}.svg`}, // -title
							callout: calloutDelegate,
							data: 'house',
							visible: false								
						});

						appleMap.addAnnotation(annot);						
					}
				});
				let span = new mapkit.CoordinateSpan(0.005, 0.005);
				var region = new mapkit.CoordinateRegion(new mapkit.Coordinate(this.currentMap.Latitude, this.currentMap.Longitude), span);
				if (document.body.clientWidth > 400) {
					region = new mapkit.CoordinateRegion(new mapkit.Coordinate(this.currentMap.Latitude + 0.001, this.currentMap.Longitude), span);
				}						
				appleMap.setRegionAnimated(region);
	
			}, (error) => {
				console.log('Error getting gems:', error);
			});				
		}, (error) => {
			console.log('Error getting maps:', error);
		});
  	}

	homeView() {
		let appleMap = mapkit.maps[0];
		this.regionChangeCounter = 0;
		appleMap.annotations.forEach(annotation => {
			annotation.visible = annotation.data == 'attraction';
		});
		setTimeout(function() {appleMap.setRotationAnimated(0);appleMap.selectedAnnotation = null;}, 600);
		let span = new mapkit.CoordinateSpan(0.005, 0.005);
		var latitude = this.currentMap.Latitude;
		if (document.body.clientWidth > 400) {						
			latitude += .001;
		}					
		var region = new mapkit.CoordinateRegion(new mapkit.Coordinate(latitude, this.currentMap.Longitude), span);
		appleMap.setRegionAnimated(region);
		appleMap.selectedAnnotation = null;
		$('#mapTitle')[0].hidden = false;
		$('#mapCharleston')[0].hidden = false;
		$('#mapLogo')[0].hidden = false;		
	}

	gotoLanding() {
		location.href = '~/landing';
	}
}