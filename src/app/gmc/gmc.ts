/// <reference types="google.maps" />
import { Component, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, addDoc, updateDoc, getDocs, GeoPoint, query, where } from "firebase/firestore";
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FirebaseUISignInFailure, FirebaseUISignInSuccessWithAuthResult } from 'firebaseui-angular';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword } from "firebase/auth";
import { HttpClient } from "@angular/common/http";
import { animationFrameScheduler } from 'rxjs';
import { linkSync } from 'fs';
import { ThisReceiver } from '@angular/compiler';

@Component({
  selector: 'changeofscenery-google-map',
  templateUrl: './gmc.html',
  styleUrls: ['./gmc.scss']
})

export class gmc implements OnInit {
  public static map: google.maps.Map;
  messageInfoWindow: google.maps.InfoWindow;  
  public static lastInfoWindow: google.maps.InfoWindow;
  public static lastCenter;
  public static lastZoomLevel;
  public static lastZoomInProgressLevel;
  public static lastTilt;
  public static lastHeading;
  public static placeCount = 0;
  public static mouseDownStartSeconds = 0;
  userLocationMarker: google.maps.Marker;
  public static places: any = [];
  public static areas: any = [];
  public static animations: any = [];
  public static likedPlaces: any = [];
  public static markerFilter: any = [2,21];
  // public static markerFilter: any = [1,2,3,4,5,6,7,8,9,10,11,12,13,14];
  public static placeMarkers: google.maps.Marker[] = [];
  public static placeTotal = 0;
  public static streetMarkers: google.maps.Marker[] = [];
  public static cloudinaryPath;
  // public static carDriveInterval;
  public static carMarker: google.maps.Marker;
  public static carStartPosition = {lat: 42.36305, lng: -71.05520};
  public static carCounter = 0;
  public static carSpeed = 0.0000005;
  public static carinfoWindowContent = "<div style='padding:7px;'><table style='width:300px;padding-right:0px;background-color:white;'><tr><td class='photo' style='padding:0px;margin:0px;vertical-align:top'>" + 
  "<table><tr style='height:20%;'><td><img id='Cadillac' src='https://res.cloudinary.com/backyardhiddengems-com/image/upload/Boston/Cadillac1.png' style='box-shadow:0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);margin-right:0.5em;' " + 
  `width='180px' height='180px'/></td>` + 
  "<td style='vertical-align:top;'><table><tr><td style='height:20px;margin:0px;'><h3><a href=\"https://www.streetsideclassics.com/vehicles/2788-dfw/1960-cadillac-series-62-convertible\" target=\"_blank\">Red Cadillac</a></h3></td><td></td></tr>" + 
  "<tr><td><span style='font-weight:700;font-size:12px;background-color:white;'>&nbsp;</span></td><td></td></tr>" + 
  "<tr><td class='description'>1960 CADILLAC SERIES 62 CONVERTIBLE</td></tr>" + 
  "<tr><td style='height:10px;'></td></tr><tr><td class='zillow'>&nbsp;</td></tr><tr><td>&nbsp;</td></tr></table></td></tr></table>" + 
  '<tr colspan="2" style="height:80%;"><td class="notes">This 1960 Cadillac Series 62 convertible was the epitome of sophisticated chic when it was released and has become even more so over the years. Opulently equipped for its time and carrying about as much style as you could possibly pack into one car, it represents the opportunity for its next lucky owner to get behind the wheel of an iconic vehicle that arguably has symbolized success over the years as much as any domestic model released.</td></tr></table>' + 
  "</td></tr><tr><td></td></tr></table></div>";
  public static carMarkerInfoWindow: google.maps.InfoWindow = new google.maps.InfoWindow({ content: gmc.carinfoWindowContent, minWidth: 320 });
  streetFilter = 'Bay';
  firstTime = true;
  public static collectionCity = 'Boston';
  public static currentCity = "boston";  
  public static currentArea;  
  public static currentPlace: any;  
  public static currentUser: any;  
  public static zooming = false;
  public static powerTouchGo = false;
  public static powerTouchLeave = false;
  public static powerTouchBack = false;
  public static centerChanged = false;
  public static centerChangeCount = 0;
  public static atAreaHome = false;
  public static cancelMarkerClick = false;
  public static selectAreaWasClicked = false;
  public static caching = false;
  public static browseMode = false;
  public static sizeMultiple = 76;
  public static cities = [{name:'charleston', displayName: 'Charleston', center:{lat: 32.77600, lng: -79.92900}, heading:-15, zoom:16, tilt:45},
                          {name:'boston', displayName: 'Boston', center:{lat: 42.300, lng: -70.90}, heading:0, zoom:10, tilt:0},
                          {name:'washingtondc',  displayName: 'Washington DC', center:{lat: 38.95380, lng: -77.08622}, heading:0, zoom:14, tilt:0}];  // {lat: 38.88500, lng: -77.01900}, heading:0, zoom:14, tilt:0
                          
  public static lastZoom = 0;
  public static zoomIntervalFunction;
  public static maxIconSize = 10;
  public static suspendUpdate = false;
  public static delay = 1; //milliseconds
  public static animateWaiting = undefined;
  public static animateWaitingMoveIndex = 0;
  public static animateCatchingUp = undefined;
  public static animateCatchingUpMoveIndex = 0;
  public static animateUber = undefined;
  public static animateRestart = false;
  public static waitUntil = 0;
  public static resumingMovement = false;
  public static lastMoveIndex = -1;
  public static stopAnimation = false;
  public static polygon1:google.maps.Polygon = undefined;
  public static polygon2:google.maps.Polygon = undefined;
  
  constructor(private route: ActivatedRoute, private ngZone: NgZone, private afAuth: AngularFireAuth, private httpClient: HttpClient) {    
  }

  ngOnInit(): void {
    this.afAuth.authState.subscribe(d => { 
      if (d != null) {
        $('td[name="coscell"]').css('padding-bottom', '0px'); 
        $('td[name="washingtondc"]').show();
        $('td[name="charleston"]').show();
        $('firebase-ui').hide();
      } else {
        $('td[name="coscell"]').css('padding-bottom', '140px'); 
        $('td[name="washingtondc"]').hide();
        $('td[name="charleston"]').hide();
      }
    });

    const auth = getAuth();

    onAuthStateChanged(auth, (user) => {
      if (user) {
        gmc.currentUser = user;
        this.getUser(user);
      } else {
        console.log('no user logged in here');
        gmc.currentUser = null;
      }
    });  

    window['angularComponentReferenceLike'] = { component: this, zone: this.ngZone, loadLike: () => this.like() }; 
    window['angularComponentReferenceUnlike'] = { component: this, zone: this.ngZone, loadUnlike: () => this.unlike() };     
    if (this.route.snapshot.url.length > 0) { 
      this.selectCity(this.route.snapshot.url[0].path);
    }

    gmc.map = new google.maps.Map(document.getElementById("google_map") as HTMLElement, {
        mapTypeControl: false,
        streetViewControl: false,
        keyboardShortcuts: false,
        gestureHandling: 'greedy',
        zoomControl: false,
        fullscreenControl: false,
        mapId: 'd5860e1d98873021'
    });

    gmc.map.addListener('click', (e) => {      
      if (gmc.lastInfoWindow != undefined) {
        gmc.lastInfoWindow.close();
        gmc.infoWindowClosing();
      } 
      gmc.lastInfoWindow = undefined;
      gmc.hideTypeList();
      this.closeAbout();
      gmc.hideAppMenu();
    });

    gmc.map.addListener('mousedown', (e) => {
      // gmc.startTouchTimers(e);
    });

    gmc.map.addListener('mouseup', (e) => {
      // gmc.cancelTouchTimers();
    });

    gmc.map.addListener('center_changed', () => {
      gmc.atAreaHome = false;
      if (gmc.zooming == true) {
        return;
      }

      if ((gmc.powerTouchGo == true || gmc.powerTouchLeave == true || gmc.powerTouchBack == true) && gmc.centerChangeCount > 0) {
        gmc.centerChanged = true;
      } else {
        gmc.centerChangeCount++;
      }

      if (gmc.suspendUpdate) {
        gmc.suspendUpdate = false;
      } else {
        // gmc.updateHouseMarkers(false);
      }
      // console.log(`center: {lat: ${gmc.map.getCenter().lat()}, lng: ${gmc.map.getCenter().lng()}},`);
      // console.log('zoomLevel', gmc.map.getZoom());
      // console.log('heading', gmc.map.getHeading());
      // console.log('tilt', gmc.map.getTilt());      
      window.scroll(0, -100);  
    });

    gmc.map.addListener('zoom_changed', () => {
      if (gmc.zooming == true) {
        setTimeout(function() { gmc.zooming = false; gmc.handleZoom(); }, 500);       
      } else {
        if (gmc.zoomIntervalFunction == undefined) {
          gmc.lastZoomInProgressLevel = gmc.map.getZoom();
          gmc.zoomIntervalFunction = setInterval(function() {
            if (gmc.lastZoomInProgressLevel == gmc.map.getZoom()) {
              clearInterval(gmc.zoomIntervalFunction);
              gmc.zoomIntervalFunction = undefined;
              gmc.handleZoom();
            } else {
              gmc.lastZoomInProgressLevel = gmc.map.getZoom();
            }
          }, 250);
        }
      }
    });

    // google.maps.event.addListenerOnce(gmc.map, 'tilesloaded', function(){
    //   gmc.caching = false;
    //     // gmc.showPlaceMarkers();
    // });

    this.messageInfoWindow = new google.maps.InfoWindow();

    if (localStorage.getItem('likedPlaces') != undefined) {
      gmc.likedPlaces = localStorage.getItem('likedPlaces').split(',');      
    }    

    setTimeout(function () {
      $("td[name='boston']").text('Boston');
      $("td[name='charleston']").text('Charleston SC');
      $("td[name='washingtondc']").text('Washington DC');
      $("img[name='instalogo']").attr('src', 'assets/Instagram-Logo.wine.svg');
      $("img[name='coslogo']").attr('src', 'assets/CoSLogoTitle.png');
      $("span[name='instaNames1']").text('@cos_boston, @cos_charleston,');
      $("span[name='instaNames2']").text('@cos_washingtondc');
    }, 100);

    $('#typeSelector').html("<img src=\"assets/shoppingWhite.svg\" width=\"18px;\" style=\"color:white;\"/> Shopping");
  }

  public logout() {
    this.afAuth.signOut();
    $('firebase-ui').show();
    gmc.hideAppMenu();
    gmc.currentArea = undefined;
    this.goBack();
  }

  successCallback(data: FirebaseUISignInSuccessWithAuthResult) {
    const auth = getAuth();
    createUserWithEmailAndPassword(auth, data.authResult.user.email, data.authResult.user.uid)
      .then((userCredential) => {
        this.getUser(userCredential.user);
      })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;      
    });
    $('firebase-ui').hide();  
  }

  async getUser(user: any) {
    const config = require('./config.js');
    const app = initializeApp(config);
    const db = getFirestore(app);
    const name = user.email == null ? user.displayName : user.email;
    const q = query(collection(db, "User"), where("Name", "==", name));    
    var querySnapshot = await getDocs(q);
    if (querySnapshot.empty == true) {
      try {
        addDoc(collection(db, 'User'), {
          "Name": name
        });
        querySnapshot = await getDocs(q);
        gmc.currentUser = querySnapshot.docs[0];
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    } else {
      gmc.currentUser = querySnapshot.docs[0];
      if (gmc.currentUser.get('City') != undefined) {
        this.selectCity(gmc.currentUser.get('City'));
      }
    }
  }

  errorCallback(data: FirebaseUISignInFailure) {
    console.warn('errorCallback', data);
  }

  uiShownCallback() {
  }

  public async selectCity(cityName) {
    $('#splash').addClass('hide');
    $('#google_map').css('height', '100vh');
    setTimeout(function() { $('#splash').css('display', 'none');$('.backButton').addClass('show');}, 1000);
    gmc.currentCity = cityName;
    var icon: google.maps.Icon;
    const city = gmc.currentCity;
    if (gmc.streetMarkers.length > 0) {
      gmc.streetMarkers.forEach(streetMarker => {
        streetMarker.setMap(null);
      });
    }
    gmc.streetMarkers = [];
    gmc.map.setCenter(gmc.cities.find(x => x.name == city).center);
    gmc.map.setTilt(gmc.cities.find(x => x.name == city).tilt);
    gmc.map.setHeading(gmc.cities.find(x => x.name == city).heading);
    gmc.map.setZoom(gmc.cities.find(x => x.name == city).zoom);
    const displayName = gmc.cities.find(x => x.name == city).displayName;
    gmc.collectionCity = displayName.replace(' ', '');
    gmc.cloudinaryPath = 'https://res.cloudinary.com/backyardhiddengems-com/image/upload/';
    gmc.cloudinaryPath += displayName.replace(' ', '%20') + '/';

    if (city == 'boston') {
      icon = {url: 'assets/boston/Cadillac.png',scaledSize: new google.maps.Size(80, 22)};
      gmc.carMarker = new google.maps.Marker({position: gmc.carStartPosition, icon: icon, map: gmc.map, zIndex: 0, title: 'Red 1960 Cadillac', optimized: true, visible: false});
      gmc.carMarker.addListener('click', () => {
        var anchor: google.maps.MVCObject = new google.maps.MVCObject(); 
        let latDelta = -0.001;
        let lngDelta = -0.001;
        anchor.set('position', {lat: gmc.carMarker.getPosition().lat() + (latDelta / gmc.map.getZoom()), lng: gmc.carMarker.getPosition().lng() + (lngDelta / gmc.map.getZoom())});
        gmc.suspendUpdate = true;
        setTimeout(function () { gmc.carMarkerInfoWindow.open({
          anchor: anchor,
          map: gmc.map,
          shouldFocus: false               
        })}, 1000);            
      });
      gmc.areas.push({name:'Hingham', lat:42.24199, lng:-70.88947, centerLat:42.24199, centerLng:-70.88947, zoom:19, heading:284, tilt:66, iconWidth:67, iconHeight:22});
      gmc.areas.push({name:'Cohasset', lat:42.2407, lng:-70.80160, centerLat:42.225, centerLng:-70.797, zoom:19, heading:0, tilt:58, iconWidth:67, iconHeight:22});    
      gmc.areas.push({name:'Scituate', lat:42.194, lng:-70.725, centerLat:42.194, centerLng:-70.725, zoom:17, heading:0, tilt:58, iconWidth:67, iconHeight:22});    
      gmc.areas.push({name:'Norwell', lat:42.16019, lng:-70.79165, centerLat:42.16019, centerLng:-70.79165, zoom:17, heading:0, tilt:58, iconWidth:67, iconHeight:22});    
      gmc.areas.push({name:'Hull', lat:42.265, lng:-70.8525, centerLat:42.265, centerLng:-70.8525, zoom:17, heading:0, tilt:58, iconWidth:47, iconHeight:22});    
      gmc.areas.push({name:'Marshfield', lat:42.095, lng:-70.6817, centerLat:42.095, centerLng:-70.6817, zoom:13, heading:0, tilt:42, iconWidth:80, iconHeight:40});    
      gmc.areas.push({name:'Boston', lat:42.35736, lng:-71.06300, centerLat:42.35736, centerLng:-70.06300, zoom:14, heading:0, tilt:0, iconWidth:80, iconHeight:40});
      gmc.areas.push({name:'Beacon Hill', lat:42.35666, lng:-71.06944, centerLat:42.35666, centerLng:-71.06944, zoom:18.75, heading:0, tilt:0, iconWidth:80, iconHeight:40});
      gmc.areas.push({name:'Downtown', lat:42.3614, lng:-71.0572, centerLat:42.3614, centerLng:-70.0572, zoom:18.75, heading:0, tilt:0, iconWidth:80, iconHeight:40});
      gmc.areas.push({name:'North End', lat:42.36380, lng:-71.05564, centerLat:42.36380, centerLng:-70.05564, zoom:18.75, heading:297, tilt:54, iconWidth:80, iconHeight:40});
    } else if (city == 'charleston') {
      gmc.areas.push({name:'RainbowRow', lat:32.77535, lng:-79.92660, centerLat:32.77580, centerLng:-79.92740, zoom:21, heading:327, tilt:90, iconWidth:120, iconHeight:40});
      gmc.areas.push({name:'EastBaySt', lat:32.77380, lng:-79.92730, centerLat:32.77355, centerLng:-79.92752, zoom:21, heading:348, tilt:64, iconWidth:120, iconHeight:40});
      gmc.areas.push({name:'EastBattery', lat:32.77130, lng:-79.92780, centerLat:32.77095, centerLng:-79.92823, zoom:21, heading:3, tilt:49, iconWidth:120, iconHeight:40});
      gmc.areas.push({name:'ChurchSt', lat:32.77230, lng:-79.92930, centerLat:32.771321, centerLng:-79.92938, zoom:21, heading:344, tilt:67, iconWidth:120, iconHeight:40});
      gmc.areas.push({name:'BroadSt', lat:32.77635, lng:-79.92920, centerLat:32.77656, centerLng:-79.93001, zoom:19, heading:285, tilt:67, iconWidth:120, iconHeight:40});
    } else if (city == 'washingtondc') {
      gmc.areas.push({name:'CityCenter', lat:38.90010, lng:-77.02600, centerLat:38.90056, centerLng:-77.02513, zoom:17, heading:360, tilt:40, iconWidth:67, iconHeight:22});
      gmc.areas.push({name:'Chinatown', lat:38.90010, lng:-77.0195, centerLat:38.90056, centerLng:-77.021, zoom:17, heading:360, tilt:40, iconWidth:67, iconHeight:22});
      gmc.areas.push({name:'PennQuarter', lat:38.89731, lng:-77.02291, centerLat:38.89681, centerLng:-77.0243, zoom:17, heading:360, tilt:40, iconWidth:67, iconHeight:22});
      gmc.areas.push({name:'FriendshipHeights', lat:38.96066, lng:-77.08571, centerLat:38.95664, centerLng:-77.08727, zoom:15, heading:0, tilt:40, iconWidth:100, iconHeight:22});
    }

    gmc.areas.forEach(area => {
      icon = {url: 'assets/' + city + '/' + area.name + '.svg',scaledSize: new google.maps.Size(area.iconWidth, area.iconHeight)};
      gmc.streetMarkers.push(new google.maps.Marker({position: {lat: area.lat, lng: area.lng}, icon: icon, map: gmc.map, zIndex: 100}));
      gmc.streetMarkers[gmc.streetMarkers.length-1].addListener('click', () => { gmc.selectArea(area); });
    });

    const config = require('./config.js');
    const app = initializeApp(config);
    const db = getFirestore(app);
    const docRef = doc(db, "User", gmc.currentUser.id);
    await updateDoc(docRef, { City:  cityName});
    if (gmc.currentCity == 'washingtondc') {
      gmc.handleZoom();
    }    
  }

  public static async handleZoom() {
    if (this.currentArea == undefined) {
      return;
    }
    const zoom = this.map.getZoom();

    if (zoom > 14 || (this.currentArea != undefined && this.currentArea.name == 'Marshfield' && zoom > 14)) {
      if ($('.backButton').hasClass('show') == false) {
        setTimeout(function () {$('.backButton').addClass('show');}, 1000);
      }
      if (this.placeMarkers.length == 0) {
        if (this.places.length == 0) {          
          try {
            const config = require('./config.js');
            const app = initializeApp(config);
            const firestoreDb = getFirestore(app);
            const querySnapshot = await getDocs(collection(firestoreDb, this.collectionCity));
            querySnapshot.forEach((doc) => {
                gmc.places.push(doc.data());
                gmc.places[gmc.places.length - 1]['id'] = doc.id;
            });
          } catch (e) {
            //$('#loading').removeClass('show');
            // $('#loading').hide();
            console.error("Error loading places: ", e);
            alert('Cannot get places, maybe due to weak Internet connection.');
          }      
          this.updatePlaceMarkers(true);
        } else {
          this.updatePlaceMarkers(true);
        }
      } else {        
        this.updatePlaceMarkers(true); 
      }
    } else if (this.placeTotal > 0) {      
      this.hidePlaceMarkers();
    }
    // $('#loading').removeClass('show');
    // $('#loading').hide();
  }

  public static updatePlaceMarkers(zooming:boolean) {

    this.places.forEach(place => {
      const marker = gmc.placeMarkers.find(m => m.getTitle() == place.Name);
      if (place.Type != undefined) {
        if (gmc.markerFilter.find(m => place.Type == m || (place.Type.indexOf(',') > -1 && place.Type.split(',').indexOf(String(m)) > -1)) || place.Type == 21) {
          if (place.Area != undefined && this.currentArea != undefined && place.Area.replaceAll(' ', '') == this.currentArea.name || gmc.currentCity == 'charleston' || (this.currentArea.name == 'Marshfield' && place.Area == 'Brant Rock')) {
            if (marker == undefined) {
                this.placeTotal++;
                this.createMarker(place);            
            } else {
              if (marker.getVisible() == false) {
                marker.setVisible(true);
              } else {
                marker.setMap(gmc.map);
                gmc.updateIcon(place, marker, false);
              }
            }
          } else if (marker != null) {
            marker.setMap(null);
          }      
        } else if (marker != undefined && place.Name != undefined) {
          console.log('hiding', place.Name);
          marker.setMap(null);
        }
      } else {
        console.log('place has no type', place.Name);
      }
    });

    this.animations.forEach(animate => {
      gmc.updateAnimateIcon(animate);      
    });    
  }

  public static createMarker(place: any) {    
    const zoomFactor = this.getZoomFactor(place);
    const iconId = this.sanitizeName(place.Name);
    var img = new Image();

    img.onload = function() {
      const city = gmc.currentCity; 
      place['imgWidth'] = img.width;
      place['imgHeight'] = img.height;
      var name = city == 'charleston' ? place.Address : gmc.sanitizeName(place.Name);
      var scaledSize = new google.maps.Size(img.width * zoomFactor, img.height * zoomFactor);      
      var url = gmc.cloudinaryPath + 'icons/' + name + '.png';
      var heartIcon = 'heart_empty';
      var likesText = place.Likes == 0 ? '0 likes' : place.Likes == 1 ? '1 like' : place.Likes + ' likes';

      if (gmc.likedPlaces.length > 0) {        
        if (gmc.likedPlaces.find(x => x == iconId) != undefined) {
          const heartX = String(img.width/3).split('.')[0];
          const heartY = String(-(img.height/3)).split('.')[0];          
          url = url.replace('/upload/', '/upload/l_heart/fl_layer_apply,x_' + heartX + ',y_' + heartY + '/');
          heartIcon = 'heart';
        }
      }

      var icon: google.maps.Icon = {
        url: url,
        scaledSize: scaledSize
      };

      if (false) {  // place.SpriteHeight != undefined
        place['imgWidth'] = place.SpriteWidth;
        place['imgHeight'] = place.SpriteHeight;
        const origin = new google.maps.Point(place.SpriteX * zoomFactor, place.SpriteY * zoomFactor);
        const size = new google.maps.Size(place.SpriteWidth * zoomFactor, place.SpriteHeight * zoomFactor);
        scaledSize = new google.maps.Size(11000 * zoomFactor, 2000 * zoomFactor);
        url = gmc.cloudinaryPath + 'icons/Sprites' + place.SpriteIndex + '.png';
        icon = { url: url, origin: origin, size: size, scaledSize: scaledSize };
      } 

      var n = place.Name;
      var animated = n == 'Boston North End' || n == 'Hingham MA' || n == 'Cohasset MA' || n == 'Scituate MA' || n == 'Boston Beacon Hill' || n == 'Hull MA' || n == 'Marshfield MA' || n == 'Norwell MA' || n == 'City Center' ? google.maps.Animation.DROP : null;
      var zIndex = place.ZIndex == undefined ? 0 : place.ZIndex;
      var visible = gmc.selectAreaWasClicked;

      const placeMarker = new google.maps.Marker({
        position: {lat: Number(place.Location.latitude), lng: Number(place.Location.longitude)},
        title: place.Name,
        icon: icon,
        optimized: true,
        animation: animated,
        map: gmc.map,
        zIndex: zIndex,
        visible: visible
      });

      const infoWindowTitle = place.Website == '' ? place.Name : `<a href='${place.Website}' target='_blank'>${place.Name}</a>`;
      const startingImageIndex = city.indexOf('washington') > -1 ? "1" : "";
      const width = document.body.clientWidth || document.body.clientHeight < 400 ? "300px" : "490px";
      const bgWidth = document.body.clientWidth || document.body.clientHeight < 400 ? "320px" : "520px";
      const imageCount = place.ImageCount > 1 ? '1/' + place.ImageCount : '';
      var contentString = `<div style='padding:7px;'><div id='imageCount'>${imageCount}</div><table style='width:${width};padding-right:0px;background-color:white;'><tr><td class='photo' style='padding:0px;margin:0px;vertical-align:top'>` + 
      `<table><tr style='height:20%;'><td><img id='${iconId}' src='${gmc.cloudinaryPath + iconId}${startingImageIndex}.png' style='box-shadow:0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);margin-right:0.5em;' ` + 
      `width='180px' height='180px' onclick='scrollImage("${gmc.cloudinaryPath}","${iconId}",${place.ImageCount})'/></td>` + 
      `<td style='vertical-align:top;'><table><tr><td style='height:20px;margin:0px;'><h3>${infoWindowTitle}</h3></td><td></td></tr>` + 
      `<tr><td><span style='font-weight:700;font-size:12px;'>${place.Address.replace(', ' + gmc.currentArea.name, '')}</span></td><td></td></tr>` + 
      `<tr><td class='descriptionInfoWindow'><img id='likedHeart${iconId}' src='assets/${heartIcon}.png' style="width:24px;margin-bottom:6px;cursor:pointer;" onclick='toggleLike("${iconId}", "${place.id}");'/><span id='likeCount${iconId}' style="position:relative;bottom:4px;left:4px;">${likesText}</span><br style="margin-bottom:32px;"/>${place.Description}</td></tr>` + 
      `<tr><td style='height:10px;'></td></tr><tr><td class='zillow'>&nbsp;</td></tr><tr><td>&nbsp;</td></tr></table></td></tr></table>` +
      `<tr colspan="2" style="height:80%;"><td class="notes">${place.Notes}</td></tr></table>` + 
      `</td></tr><tr><td></td></tr></table></div>`;

      if (place.Name == 'Bin26Enoteca') {
        contentString = "<img src=\"https://res.cloudinary.com/backyardhiddengems-com/image/upload/Boston/Bin26EnotecaBG.png\" width=\"" + bgWidth + "\"" + 
                        " style=\"margin-bottom:-10px;cursor:pointer;\" onclick=\"window.open('http://bin26.com/');\" />" + 
                        "<div class=\"popup\">" + 
                        "   <h1 style=\"margin-bottom:24px;\">Bin 26 Enoteca is a Beacon Hill neighborhood restaurant with a seasonally driven menu and international list of old world wines.</h1>" + 
                        "   <a href=\"http://bin26.com/reservations-2/\" target=\"_blank\">Reservations</a><br/><br/>" + 
                        "   <a href=\"http://bin26.com/bin26wordpress/wp-content/uploads/2022/04/Wine-BTG-2022-Wine-list-8.pdf\" target=\"_blank\">Wines by the Glass &amp; Beer</a><br/><br/>" + 
                        "   <a href=\"http://bin26.com/bin26wordpress/wp-content/uploads/2022/04/Wine-BTG-2022-3.pdf\" target=\"_blank\">Cellar List</a><br/><br/>" + 
                        "   <a href=\"http://bin26.com/bin26wordpress/wp-content/uploads/2022/04/Dinner-Menu-2022-4.pdf\" target=\"_blank\">Dinner Menu</a><a href=\"http://bin26.com/\" target=\"_blank\" style=\"margin-left:110px;\">Full Website</a>" + 
                        "</div>";
      }
  
      const markerInfoWindow: google.maps.InfoWindow = new google.maps.InfoWindow({ content: contentString, minWidth: 320 });
      
      markerInfoWindow.addListener('closeclick', () => {
        gmc.infoWindowClosing();
      });
      let map = gmc.map;
  
      placeMarker.addListener('click', () => {
        if (gmc.cancelMarkerClick == true) {
          gmc.cancelMarkerClick = false;
          return;
        }
        gmc.hideAppMenu();              
        gmc.currentPlace = place;
        gmc.lastCenter = gmc.map.getCenter();
        gmc.lastZoomLevel = gmc.map.getZoom();
        gmc.lastTilt = gmc.map.getTilt();
        gmc.lastHeading = gmc.map.getHeading();
        // houseMarker.setAnimation(google.maps.Animation.BOUNCE);
        // setTimeout(function () {houseMarker.setAnimation(null);}, 500);
        if (gmc.lastInfoWindow != undefined) {
          gmc.lastInfoWindow.close();
        } 
        gmc.lastInfoWindow = markerInfoWindow;            
        var anchor: google.maps.MVCObject = new google.maps.MVCObject(); 
        let latDelta = city == 'boston' ? 0.000 : 0.004;
        let lngDelta = city == 'boston' ? 0.000 : -0.003;
        anchor.set('position', {lat: placeMarker.getPosition().lat() + (latDelta / gmc.map.getZoom()), lng: placeMarker.getPosition().lng() + (lngDelta / gmc.map.getZoom())});
        gmc.updatePlaceMarkers(false);
        gmc.suspendUpdate = true;
        var selectIcon = n == 'Boston North End' || n == 'Hingham MA' || n == 'Cohasset MA' || n == 'Scituate MA' || n == 'Boston Beacon Hill' || n == 'Hull MA' || n == 'Marshfield MA' || n == 'Norwell MA' || n == 'City Center' || n == 'Chinatown' || n == 'Penn Quarter';
        gmc.updateIcon(place, placeMarker, selectIcon);
        markerInfoWindow.open({anchor: anchor, map, shouldFocus: false});        
        setTimeout(function () {
          const iconId = gmc.sanitizeName(place.Name);  
          if (gmc.likedPlaces.find(x => x == iconId) != undefined) {
            $('#likedHeart' + iconId).attr('src', 'assets/heart.png');
          }
          if (gmc.currentPlace.Likes > 0) {
            const plural = gmc.currentPlace.Likes != 1 ? 's' : '';
            $('#likeCount' + iconId).text(gmc.currentPlace.Likes + ' like' + plural);
          }
        }, 50);
      });

      placeMarker.addListener('mousedown', (e) => {
        // gmc.startTouchTimers(e);
      });

      placeMarker.addListener('mouseup', () => {
        // gmc.cancelTouchTimers();
      }); 

      gmc.placeMarkers.push(placeMarker);
      gmc.placeCount++;

      if (gmc.placeCount == gmc.placeTotal) {
        setTimeout(function() {
         $('#loading').removeClass('show');
        }, 2000);
      }
    }

    var name = gmc.currentCity == 'charleston' ? place.Address : this.sanitizeName(place.Name);

    // if (place.SpriteHeight != undefined) {
    //   img.src = this.cloudinaryPath + 'icons/Sprites' + place.SpriteIndex + '.png';
    // } else {
      img.src = this.cloudinaryPath + 'icons/' + name + '.png';    
    // }
  }

  public static clearHouseMarkers() {
    this.placeMarkers.forEach(marker => {
      marker.setMap(null);
    });
    this.placeTotal = 0;
  }

  public static hidePlaceMarkers() {
    this.placeMarkers.forEach(marker => {
      marker.setVisible(false);
    });
  }

  public static showPlaceMarkers() {    
    this.placeMarkers.forEach(marker => {
      marker.setVisible(true);
    });
  }

  public static startTouchTimers(e) {
    gmc.powerTouchGo = true;      
    gmc.powerTouchLeave = true;
    gmc.powerTouchBack = true;
    setTimeout(function() {
      if (gmc.powerTouchGo == true && gmc.centerChanged == false) {
        gmc.map.setCenter(e.latLng);
        gmc.map.setZoom(18);
        gmc.cancelMarkerClick = true;
      }
    }, 1000);
    setTimeout(function() {
      if (gmc.powerTouchLeave == true && gmc.centerChanged == false) {
        gmc.map.setCenter(new google.maps.LatLng(gmc.currentArea.centerLat, gmc.currentArea.centerLng));
        gmc.map.setZoom(gmc.currentArea.zoom);
        gmc.cancelMarkerClick = true;
      }
    }, 3000);
    // setTimeout(function() {
    //   if (gmc.powerTouchBack == true) {
    //     gmc.hidePlaceMarkers();
    //     gmc.goBack('on');
    //     gmc.cancelMarkerClick = true;
    //   }
    // }, 5000);
  }

  public static cancelTouchTimers() {
    gmc.powerTouchGo = false;
    gmc.powerTouchLeave = false;
    gmc.powerTouchBack = false;
    gmc.centerChanged = false;
    gmc.centerChangeCount = 0;
  }

  openAppMenu() {
    if ($('.appMenu').css('bottom') == '0px') {
      this.hideAppMenu();
    } else {
      $('#mapLogo').hide();
      $('.appMenu').css('display', 'block');
      $('.appMenu').removeClass('close');    
      $('.appMenu').addClass('open');    
    }
  }

  openTypeList() {
    if ($('#typeList').attr('hidden') == undefined) {
      this.hideTypeList();
    } else {
      $('#typeList').removeClass('close');
      $('#typeList').addClass('open');    
      $('#typeList').removeAttr('hidden');
    }
  }
  
  selectType(typeId) {
    gmc.hideTypeList();
    gmc.gotoAreaHome();
    gmc.markerFilter = [typeId];
    switch (typeId) {
      case 1:
        $('#typeSelector').html("<img src=\"assets/diningWhite.svg\" width=\"16px;\" style=\"color:white;\"/> Restaurant");
        break;
      case 2:
        $('#typeSelector').html("<img src=\"assets/shoppingWhite.svg\" width=\"18px;\" style=\"color:white;\"/> Shopping");
        break;
      case 3:
        $('#typeSelector').html("<img src=\"assets/hotelWhite.svg\" width=\"18px;\" style=\"color:white;\"/> Hotel");
        break;
      case 4:
        if (gmc.currentArea.name == 'FriendshipHeights') {
          $('#typeSelector').html(`<img src=\"assets/medicalWhite.svg\" width=\"24px;\" style=\"color:white;\"/> Medical`);
        } else {
          $('#typeSelector').html(`<img src=\"assets/historyWhite.svg\" width=\"24px;\" style=\"color:white;\"/> History`);
        }
        break;
      case 5:
        if (gmc.currentArea.name == 'FriendshipHeights') {
          $('#typeSelector').html("<img src=\"assets/educationWhite.svg\" width=\"18px;\" style=\"color:white;\"/> Education");
        } else {
          $('#typeSelector').html("<img src=\"assets/museumWhite.svg\" width=\"18px;\" style=\"color:white;\"/> Museum");
        }
        break;
      case 6:
        if (gmc.currentArea.name == 'FriendshipHeights') {
          $('#typeSelector').html("<img src=\"assets/petWhite.svg\" width=\"18px;\" style=\"color:white;\"/> Pet");
        } else {
          $('#typeSelector').html("<img src=\"assets/theaterWhite.svg\" width=\"18px;\" style=\"color:white;\"/> Theatre");
        }
        break;
      case 7:
        $('#typeSelector').html("<img src=\"assets/funWhite.svg\" width=\"16px;\" style=\"color:white;\"/> Fun");
        break;
      case 8:
        $('#typeSelector').html("<img src=\"assets/pharmacyWhite.svg\" width=\"18px;\" style=\"color:white;\"/> Pharmacy");
        break;
      case 9:
        $('#typeSelector').html("<img src=\"assets/beautyWhite.svg\" width=\"18px;\" style=\"color:white;\"/> Beauty");
        break;
      case 10:
        $('#typeSelector').html("<img src=\"assets/gymWhite.svg\" width=\"18px;\" style=\"color:white;\"/> Gym");
        break;
      case 13:
        if (gmc.currentArea.name == 'FriendshipHeights') {
          $('#typeSelector').html(`<img src=\"assets/condoWhite.svg\" width=\"24px;\" style=\"color:white;\"/> Condo`);
        } else {
          $('#typeSelector').html(`<img src=\"assets/buildingWhite.svg\" width=\"24px;\" style=\"color:white;\"/> Residential`);
        }
        break;
      case 14:
        if (gmc.currentArea.name == 'FriendshipHeights') {
          $('#typeSelector').html(`<img src=\"assets/apartmentWhite.svg\" width=\"24px;\" style=\"color:white;\"/> Apartment`);
        } else {
          $('#typeSelector').html(`<img src=\"assets/officeWhite.svg\" width=\"24px;\" style=\"color:white;\"/> Office`);
        }
        break;
      case 20:
        $('#typeSelector').html(`<img src=\"assets/allWhite.svg\" width=\"24px;\" style=\"color:white;\"/> All`);
        gmc.markerFilter = [1,2,3,4,5,6,7,8,9,10,11,12,13,14];
        break;
      default:
        break;
    }
    gmc.updatePlaceMarkers(false);
  }

  public hideAppMenu() {
    gmc.hideAppMenu();
  }

  public hideTypeList() {
    gmc.hideTypeList();
  }

  public static hideAppMenu() {
    $('.appMenu').addClass('close');
    $('.appMenu').removeClass('open');
    $('#mapLogo').show();
  }
  
  public static hideTypeList() {
    $('#typeList').addClass('close');
    $('#typeList').removeClass('open');
    $('#typeList').prop('hidden', true);
  }
  
  public hideSplash() {
    $('#splash').addClass('hide');
    $('#splash').css('display', 'none');
  }

  public static selectArea(area) {
    if (area.name == 'FriendshipHeights' && gmc.polygon1 == undefined) {
      const FHDCPoints = [new google.maps.LatLng(38.95102, -77.08351),
                          new google.maps.LatLng(38.95649, -77.09126),
                          new google.maps.LatLng(38.96501, -77.08030),
                          new google.maps.LatLng(38.95705, -77.08033),
                          new google.maps.LatLng(38.95703, -77.07993),
                          new google.maps.LatLng(38.95595, -77.07949),
                          new google.maps.LatLng(38.95470, -77.07927),
                          new google.maps.LatLng(38.95212, -77.07985),
                          new google.maps.LatLng(38.95062, -77.08026),
                          new google.maps.LatLng(38.95064, -77.08064),
                          new google.maps.LatLng(38.95102, -77.08076)
                         ];
      const FHVPoints = [new google.maps.LatLng(38.96190, -77.08632),
                         new google.maps.LatLng(38.96176, -77.08714),
                         new google.maps.LatLng(38.96189, -77.08801),
                         new google.maps.LatLng(38.96206, -77.08900),
                         new google.maps.LatLng(38.96216, -77.08981),
                         new google.maps.LatLng(38.96243, -77.09113),
                         new google.maps.LatLng(38.96271, -77.09240),
                         new google.maps.LatLng(38.96278, -77.09336),
                         new google.maps.LatLng(38.96271, -77.09453),
                         new google.maps.LatLng(38.96263, -77.09512),
                         new google.maps.LatLng(38.96249, -77.09538),
                         new google.maps.LatLng(38.96281, -77.09562),
                         new google.maps.LatLng(38.96307, -77.09561),
                         new google.maps.LatLng(38.96392, -77.09238),
                         new google.maps.LatLng(38.96428, -77.09114),
                         new google.maps.LatLng(38.96469, -77.08984),
                         new google.maps.LatLng(38.96448, -77.08874),
                         new google.maps.LatLng(38.96508, -77.08903),
                         new google.maps.LatLng(38.96546, -77.08803)                         
                        ];
      gmc.polygon1 =  new google.maps.Polygon({paths: FHVPoints, fillColor: "#8888DD", fillOpacity: 0.1, strokeColor: "#8888DD", strokeOpacity: 1, strokeWeight: 3, map: gmc.map});
      gmc.polygon2 = new google.maps.Polygon({paths: FHDCPoints, fillColor: "#DD8888", fillOpacity: 0.1, strokeColor: "#DD8888", strokeOpacity: 1, strokeWeight: 3, map: gmc.map});
    } else {
      gmc.polygon1.setVisible(true);
      gmc.polygon2.setVisible(true);
    }

    $('#typeSelector').removeAttr('hidden');
    gmc.selectAreaWasClicked = true;
    if (gmc.placeCount == 0) {
      $('#loading').addClass('show');
    }
    if (area.name == 'FriendshipHeights') {
      $('#type4').html("<img src=\"assets/medical.svg\" width=\"24px;\"/>&nbsp;Medical");
      $('#type5').html("<img src=\"assets/education.svg\" width=\"18px;\"/>&nbsp;Education");
      $('#type6').html("<img src=\"assets/pet.svg\" width=\"18px;\"/>&nbsp;Pet");
    } else {
      $('#type4').html("<img src=\"assets/history.svg\" width=\"24px;\"/>&nbsp;History");
      $('#type5').html("<img src=\"assets/museum.svg\" width=\"18px;\"/>&nbsp;Museum");
      $('#type6').html("<img src=\"assets/theater.svg\" width=\"18px;\"/>&nbsp;Theatre");
    }
    gmc.currentArea = area;
    this.zooming = true;    
    this.map.setCenter({lat: area.centerLat, lng: area.centerLng});
    this.map.setZoom(area.zoom);    
    this.map.setTilt(area.tilt);
    this.map.setHeading(area.heading);
    this.zooming = false;       
  
    if (this.lastInfoWindow != undefined) {
      this.lastInfoWindow.close();
      this.lastInfoWindow = undefined;
    } 
    
    gmc.hideAppMenu();
    
    if (area.name == 'Boston') {
      this.streetMarkers.find(x => x.getIcon()['url'].indexOf('Boston') > -1).setVisible(false);
      if (area.zoom > 13 && area.zoom < 16 && area.lat > 40) {
        var index = 6;
        while(index++<9)
        {
          this.streetMarkers[index].setVisible(true);
        }
      }
    } else {                 
      if (this.currentCity == 'washingtondc') {
        gmc.streetMarkers.forEach(streetMarker => {
          streetMarker.setVisible(false);
        });
      } else {
        this.streetMarkers.find(x => x.getIcon()['url'].indexOf(area.name.replace(' ', '')) > -1).setVisible(false);
      }
      if (area.name == 'North End') {
        // setTimeout(function() {
        //   this.carMarker.setVisible(true);
        //   this.carDriveInterval = setInterval(function() {
        //     let pos:google.maps.LatLng = this.carMarker.getPosition();
        //     let newPos = { lat: pos.lat() + this.carSpeed, lng: pos.lng() +  + this.carSpeed }; 
        //     this.carMarker.setPosition(newPos);
        //     this.carCounter++;
        //     if (this.carCounter == 50) {
        //       this.carSpeed = 0.000001;
        //     }
        //     if (this.carCounter > 1500) {
        //       const icon = {url: 'assets/boston/CadillacBack.png',scaledSize: new google.maps.Size(80, 22)};
        //       this.carMarker.setIcon(icon);
        //       this.carSpeed = 0.0000005;
        //       this.carDriveInterval = setInterval(function() {
        //         let pos:google.maps.LatLng = this.carMarker.getPosition();
        //         let newPos = { lat: pos.lat() - (this.carSpeed), lng: pos.lng() - (this.carSpeed + 0.00000001) };     
        //         this.carMarker.setPosition(newPos);
        //         this.carCounter++;
        //         if (this.carCounter > 9500) {
        //           clearInterval(this.carDriveInterval);
        //           this.carMarker.setVisible(false);
        //         }              
        //       }, 800);
        //     }
        //   }, 1);

        // }, 5000);
      } else if (area.name == 'City Center' || area.name == 'Chinatown' || area.name == 'Penn Quarter') {
        setTimeout(function() {
          gmc.startAnimation();
        }, 2000);
      }
      gmc.atAreaHome = true;
    }
  }

  public static async startAnimation() {
    this.stopAnimation = false;
    const zoomFactor = this.getZoomFactor(null);
    const config = require('./config.js');
    const app = initializeApp(config);
    const db = getFirestore(app);
    const querySnapshot = await getDocs(collection(db, this.collectionCity + 'Animated'));
    const city = gmc.currentCity; 
    
    querySnapshot.forEach((doc) => {
      const animation = doc.data();
      if (animation.Area.name == gmc.currentArea.name) {
        this.animations.push(doc.data());
        this.animations[this.animations.length - 1]['id'] = doc.id;      
      }
    });

    this.animations.forEach(animation => {
      var img = new Image();

      img.onload = function() {
        const iconId = gmc.sanitizeName(animation.Name);
        animation['imgWidth'] = img.width/4;
        animation['imgHeight'] = img.height/4;  
        var scaledSize = new google.maps.Size(animation.imgWidth * zoomFactor, animation.imgHeight * zoomFactor);

        var icon: google.maps.Icon = {
          url: img.src,
          scaledSize: scaledSize,        
        };

        const latlng = new google.maps.LatLng(animation.Location.latitude, animation.Location.longitude);
        var zIndex = animation.ZIndex == undefined ? 0 : animation.ZIndex;

        animation['Marker'] = new google.maps.Marker({
          position: latlng,
          icon: icon,
          optimized: true,
          map: gmc.map,
          zIndex: zIndex
        });

        const width = document.body.clientWidth || document.body.clientHeight < 400 ? "300px" : "490px";
        const contentString = `<div style='padding:7px;'><table style='width:${width};padding-right:0px;background-color:white;'><tr><td class='photo' style='padding:0px;margin:0px;vertical-align:top'>` + 
        `<table><tr style='height:20%;'><td><img id='${iconId}' src='${gmc.cloudinaryPath + iconId}.png' style='box-shadow:0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);margin-right:0.5em;' ` + 
        `width='180px' height='180px' onclick='scrollImage("${gmc.cloudinaryPath}","${iconId}",1)'/></td>` + 
        `<td style='vertical-align:top;'><table><tr><td style='height:20px;margin:0px;'><h3>${animation.Name}</a></h3></td><td></td></tr>` + 
        `<tr><td><span style='font-weight:700;font-size:12px;'></td><td></td></tr><tr><td class='descriptionInfoWindow'>` + 
        `<img id='likedHeart${iconId}' src='assets/heart_empty.png' style="width:24px;margin-bottom:6px;cursor:pointer;" onclick='toggleLike("${iconId}", "${animation.id}");'/><span id='likeCount${iconId}' style="position:relative;bottom:4px;left:4px;">0 likes</span><br style="margin-bottom:32px;"/>${animation.Description}</td></tr>` + 
        `<tr><td style='height:10px;'></td></tr><tr><td class='zillow'>&nbsp;</td></tr><tr><td>&nbsp;</td></tr></table></td></tr></table>` +
        `<tr colspan="2" style="height:80%;"><td class="notes">${animation.Notes}</td></tr></table>` + 
        `</td></tr><tr><td></td></tr></table></div>`;  
        const markerInfoWindow: google.maps.InfoWindow = new google.maps.InfoWindow({ content: contentString, minWidth: 320 });
        
        markerInfoWindow.addListener('closeclick', () => {
          gmc.infoWindowClosing();
        });
        let map = gmc.map;
    
        animation.Marker.addListener('click', () => {              
          gmc.lastCenter = gmc.map.getCenter();
          gmc.lastZoomLevel = gmc.map.getZoom();
          gmc.lastTilt = gmc.map.getTilt();
          gmc.lastHeading = gmc.map.getHeading();
          if (gmc.lastInfoWindow != undefined) {
            gmc.lastInfoWindow.close();
          } 
          gmc.lastInfoWindow = markerInfoWindow;            
          var anchor: google.maps.MVCObject = new google.maps.MVCObject(); 
          let latDelta = city == 'boston' ? 0.000 : 0.004;
          let lngDelta = city == 'boston' ? 0.000 : -0.003;
          anchor.set('position', {lat: animation.Marker.getPosition().lat() + (latDelta / gmc.map.getZoom()), lng: animation.Marker.getPosition().lng() + (lngDelta / gmc.map.getZoom())});
          gmc.updatePlaceMarkers(false);
          gmc.suspendUpdate = true;
          markerInfoWindow.open({anchor: anchor, map, shouldFocus: false});        
        });

        animation['AnimationCounter'] = 0;
        if (animation.Name == 'Uber') {
          gmc.animateUber = animation;
        } else {
          gmc.animateMarker(animation, 0);
        }
      }

      if (animation.Name == 'Uber') {
        const seconds = new Date().getSeconds();
        const carName = seconds % 2 == 0 ? 'RollsRoyceUber' : 'CadillacUber';
        img.src = this.cloudinaryPath + carName + '.png';
      } else {
        img.src = this.cloudinaryPath + this.sanitizeName(animation.Name) + '.png';
      }
    });
  }
  
  public static async animateMarker(animate, animationIndex) {    
    const animations = JSON.parse(animate.Route);
    if (animationIndex > animations.length - 1 || this.stopAnimation == true) {
      return;
    }
    const animation = animations[animationIndex];
    if (animation.cmd == 'go') {
      if (animate.Marker.getZIndex() != 100) { animate.Marker.setZIndex(100); }
      if (animate.AnimationCounter == 0) {        
        animate['DeltaLat'] = (animation.loc.lat - animate.Location.latitude)/animation.speed;
        animate['DeltaLng'] = (animation.loc.lng - animate.Location.longitude)/animation.speed;
      } else {
        const lat = animate.Location.latitude + animate.DeltaLat;
        const lng = animate.Location.longitude + animate.DeltaLng;
        animate.Location = new GeoPoint(lat, lng);
        animate.Marker.setPosition(new google.maps.LatLng(lat, lng));
      }
      if(animate.AnimationCounter != animation.speed){
        animate.AnimationCounter++;
        setTimeout(function () { gmc.animateMarker(animate, animationIndex) }, this.delay);
      } else if (animationIndex < animations.length - 1) {
        animationIndex++;
        animate.AnimationCounter = 0;
        this.animateMarker(animate, animationIndex);
      }
    } else if (animation.cmd == 'wait') {
      if (animate == undefined) {
        console.log('no animate');        
      } else {
        var url = animate.Marker.getIcon()['url'];;
        var scaledSize = animate.Marker.getIcon()['scaledSize'];
        animate.Marker.setVisible((animation.hid == 0));
        if (animation.att != '') {        
          if (animation.att == 'WellDressedWomanFerragamos') {
            url = url.replaceAll('WellDressedWoman', 'WellDressedWomanFerragamos');
            url = url.replace('l_dolcezza_cup/fl_layer_apply,x_-80,y_-120/', '');
          } else if (animation.att == 'WellDressedManGlasses' && url.indexOf('WellDressedManGlasses') == -1) {
            url = url.replaceAll('WellDressedMan', 'WellDressedManGlasses');
          } else if (animation.att == "Man" || animation.att == "Woman") {
            if (this.animateWaiting == undefined) {
              this.animateWaiting = animate;
              this.animateWaitingMoveIndex = animationIndex;
              this.waitUntil =  new Date().getMilliseconds() + animation.dur * 1000;            
            } else {
              const timeToWait = this.waitUntil - new Date().getMilliseconds();
              this.animateCatchingUp = animate;
              this.animateCatchingUpMoveIndex = animationIndex;
              setTimeout(function() {
                setTimeout(function() { 
                  gmc.animateWaitingMoveIndex++;
                  gmc.animateCatchingUpMoveIndex++;
                  gmc.animateMarker(gmc.animateWaiting, gmc.animateWaitingMoveIndex);
                  gmc.animateMarker(gmc.animateCatchingUp, gmc.animateCatchingUpMoveIndex);                 
                }, animation.dur * 1000);
              }, timeToWait);
            }
          } else if (animation.att == 'WomanSwapBags') {
            url = `${gmc.cloudinaryPath}WellDressedWomanStraightArms.png`;
            url = url.replace('/upload/', `/upload/l_hermesbg/fl_layer_apply,x_${animation.attx},y_${animation.atty}/`);
            url = url.replace('/upload/', `/upload/l_tiffany_bag/fl_layer_apply,x_60,y_140/`);
          } else if (animation.att == 'ManSwapBags') {
            url = `${gmc.cloudinaryPath}WellDressedMan.png`;
            url = url.replace('/upload/', `/upload/l_boss_bag/fl_layer_apply,x_${animation.attx},y_${animation.atty}/`);
          } else if (animation.att == 'CallUber') {
            gmc.animateMarker(gmc.animateUber, 0);
          } else if (animation.att == 'CarArrived') { 
            gmc.resumingMovement = true;
            gmc.animateWaitingMoveIndex += 6;
            gmc.animateCatchingUpMoveIndex += 6;
            gmc.animateMarker(gmc.animateWaiting, gmc.animateWaitingMoveIndex);
            gmc.animateMarker(gmc.animateCatchingUp, gmc.animateCatchingUpMoveIndex);
          } else if (animation.att == 'Restart') {          
            this.animateRestart = true;
          } else if (animation.att == 'RemoveAttachment') {
            if (url.indexOf('StyleandFlair') > -1) {
              url = gmc.cloudinaryPath + 'StyleandFlair.png';
            } else if (url.indexOf('CapriandButtonDown') > -1) {
              url = gmc.cloudinaryPath + 'CapriandButtonDown.png';
            }
          } else if (animation.att == 'BigHeads') {
            url = url.replace('CapriandButtonDown', 'CapriandButtonDownBigHeads');  
          } else {
            const cloudinaryCity = gmc.cloudinaryPath.split('/')[gmc.cloudinaryPath.split('/').length - 2];
            url = url.replace(`/${cloudinaryCity}/`, `/l_${animation.att}/fl_layer_apply,x_${animation.attx},y_${animation.atty}/${cloudinaryCity}/`);          
          }
        } else if (animation.att1 != undefined) {
          url = url.replace('/upload/', `/upload/l_${animation.att1}/fl_layer_apply,x_${animation.attx1},y_${animation.atty1}/`);
          url = url.replace('/upload/', `/upload/l_${animation.att2}/fl_layer_apply,x_${animation.attx2},y_${animation.atty2}/`);
        }

        var icon: google.maps.Icon = {
          url: url,
          scaledSize: scaledSize,
        };
        animate.Marker.setIcon(icon);      

        if (animation.att != "Man" && animation.att != "Woman") {
          setTimeout(function() { 
            if (gmc.animateRestart == true) {
              gmc.animateWaiting = undefined;
              gmc.animateCatchingUp = undefined;
              gmc.animateWaitingMoveIndex = 0;
              gmc.animateCatchingUpMoveIndex = 0;
              gmc.animateRestart = false;
              const zoomFactor = gmc.getZoomFactor(null);
              gmc.animations.forEach(animate => {
                var img = new Image();
                img.onload = function() {
                  animate['imgWidth'] = img.width/4;
                  animate['imgHeight'] = img.height/4;  
                  var scaledSize = new google.maps.Size(animate.imgWidth * zoomFactor, animate.imgHeight * zoomFactor);        
                  var icon: google.maps.Icon = {
                    url: img.src,
                    scaledSize: scaledSize,        
                  };
                  animate.Marker.setPosition(new google.maps.LatLng(animate.Location.latitude, animate.Location.longitude));
                  animate.Marker.setIcon(icon);
                  animate['AnimationCounter'] = 0;
                  if (animate.Name == 'Uber') {
                    gmc.animateUber = animate;
                  } else {
                    gmc.animateMarker(animate, 0);
                  }  
                };        
                if (animate.Name == 'Uber') {
                  const seconds = new Date().getSeconds();
                  const carName = seconds % 2 == 0 ? 'RollsRoyceUber' : 'CadillacUber';
                  img.src = gmc.cloudinaryPath + carName + '.png';
                } else {
                  img.src = gmc.cloudinaryPath + gmc.sanitizeName(animate.Name) + '.png';
                }
              });
            } else {
              if (animationIndex < animations.length - 1) {
                animationIndex++;
                animate.Marker.setVisible(true);
                gmc.animateMarker(animate, animationIndex);
              }
            }  
          }, animation.dur * 1000);
        }
      }
    } else if (animation.cmd == 'break') {
    }
  }

  public goBack() {
    // if (gmc.atAreaHome == false && gmc.currentArea != undefined) {
    //   gmc.gotoAreaHome();
    //   $('#typeSelector').prop('hidden', true);
    //   return;
    // }    
    gmc.stopAnimation = true;
    gmc.animations.forEach(animation => {
      animation.Marker.setMap(null);
    });
    gmc.animations = [];

    if (gmc.polygon1 != undefined) {
      if (gmc.polygon1.getVisible() == true) {
        gmc.polygon1.setVisible(false);
        if (gmc.polygon2 != undefined) { gmc.polygon2.setVisible(false); }
        if (gmc.currentCity == 'boston' && gmc.currentArea != undefined) {
          if (gmc.currentArea.name == 'Beacon Hill' || gmc.currentArea.name == 'Downtown' || gmc.currentArea.name == 'North End') {
            gmc.clearHouseMarkers();
            gmc.zooming = true;    
            gmc.map.setCenter({lat: 42.35736, lng: -71.06300});
            gmc.map.setZoom(14.00);    
            gmc.map.setTilt(0);
            gmc.map.setHeading(0); 
            var index = 6;    
            while(index++<9)
            {
              gmc.streetMarkers[index].setVisible(true);
            }
            gmc.streetMarkers[6].setVisible(false);
            gmc.currentArea = gmc.areas.find((a: { name: string; }) => a.name == 'Boston');
          }
        } else {
          if (gmc.currentArea != undefined) {
            if (gmc.currentArea.name == 'Boston') {
              gmc.streetMarkers.find(x => x.getIcon()['url'].indexOf('Boston') > -1).setVisible(true);
            } else {
              gmc.streetMarkers.find(x => x.getIcon()['url'].indexOf(gmc.currentArea.name.replace(' ', '')) > -1).setVisible(true);
            }
          }
          gmc.zooming = true;
          gmc.map.setCenter(gmc.cities.find(x => x.name == gmc.currentCity).center);
          gmc.map.setZoom(gmc.cities.find(x => x.name == gmc.currentCity).zoom);
          gmc.map.setHeading(gmc.cities.find(x => x.name == gmc.currentCity).heading);
          gmc.map.setTilt(gmc.cities.find(x => x.name == gmc.currentCity).tilt);

          if (gmc.currentCity == 'boston' && gmc.currentArea != undefined) {          
            if (gmc.currentArea.name == 'Boston') {
              var index = 6;
              while(index++<9)
              {
                const url = gmc.streetMarkers[index].getIcon()['url'];
                if (url.indexOf('BeaconHill') > -1 || url.indexOf('Downtown') > -1 || url.indexOf('NorthEnd') > -1 ) {
                  gmc.streetMarkers[index].setVisible(false);
                }
              }
            } else if (gmc.currentArea.name == 'Beacon Hill' || gmc.currentArea.name == 'Downtown' || gmc.currentArea.name == 'North End') {
              gmc.currentArea = gmc.areas.find((a: { name: string; }) => a.name == 'Boston');
              gmc.zooming = true;    
              gmc.map.setCenter({lat: 42.35736, lng: -71.06300});
              gmc.map.setZoom(14.00);
              gmc.map.setTilt(0);
              gmc.map.setHeading(0);
              var index = 6;
              while(index++<9)
              {
                gmc.streetMarkers[index].setVisible(true);
              }      
            }
          } else {
            gmc.hidePlaceMarkers();
            gmc.streetMarkers.forEach(streetMarker => {
              streetMarker.setVisible(true);
            });
            gmc.currentArea = undefined;
          }
        }      
      } else {
        // setTimeout(function() {          
          //$('#google_map').css('height', '0vh');
          $('#splash').removeClass('hide');
          $('#splash').css('display', 'flex');
          $('.backButton').removeClass('show');
        // }, 2000);
      }
    }

    $('#typeSelector').prop('hidden', true);

    if (gmc.lastInfoWindow != undefined) {
      gmc.lastInfoWindow.close();
      gmc.lastInfoWindow = undefined;
    } 
  }

  public static gotoAreaHome() {
    const area = gmc.currentArea;
    gmc.map.setCenter({lat: area.centerLat, lng: area.centerLng});
    gmc.map.setZoom(area.zoom);    
    gmc.map.setTilt(area.tilt);
    gmc.map.setHeading(area.heading);
    gmc.atAreaHome = true;
  }

  public static infoWindowClosing() {
    this.map.setCenter({lat: this.lastCenter.lat(), lng: this.lastCenter.lng()});
    this.map.setZoom(this.lastZoomLevel);
    this.map.setTilt(this.lastTilt);
    this.map.setHeading(this.lastHeading);
  }

  public static updateIcon(place:any, marker:google.maps.Marker, select:boolean) {
    let zoomFactor = this.getZoomFactor(place);
    
    if (select) {
      zoomFactor += 0.1;
    }

    const imgWidth = Number(place.imgWidth);
    const imgHeight = Number(place.imgHeight);
    var scaledSize: google.maps.Size;
    var newUrl = marker.getIcon()['url'];

    if (newUrl.indexOf('/l_v') == -1) {
      var heartX = String(imgWidth / 3).split('.')[0];
      var heartY = String(-(imgHeight/3)).split('.')[0];
      newUrl = newUrl.replace('/v', '/l_v1655671870:heart.png,x_' + heartX + ',y_' + heartY + '/v');
    }

    var icon: google.maps.Icon;

    if (false) {  // place.SpriteHeight != undefined
      place['imgWidth'] = place.SpriteWidth;
      place['imgHeight'] = place.SpriteHeight;
      const origin = new google.maps.Point(place.SpriteX * zoomFactor, place.SpriteY * zoomFactor);
      const size = new google.maps.Size(place.SpriteWidth * zoomFactor, place.SpriteHeight * zoomFactor);
      scaledSize = new google.maps.Size(11000 * zoomFactor, 2000 * zoomFactor);
      icon = { url: newUrl, origin: origin, size: size, scaledSize: scaledSize };
    } else {
      scaledSize = new google.maps.Size(imgWidth * zoomFactor, imgHeight * zoomFactor);
      icon = { url: newUrl, scaledSize: scaledSize };
    }

    marker.setIcon(icon);
  }

  public static updateAnimateIcon(animate:any) {
    let zoomFactor = this.getZoomFactor(null);
    const scaledSize = new google.maps.Size(animate.imgWidth * zoomFactor, animate.imgHeight * zoomFactor);
    var newUrl = animate.Marker.getIcon()['url'];

    if (newUrl.indexOf('/l_v') == -1) {
       var heartX = String(animate.imgWidth / 3).split('.')[0];
       var heartY = String(-(animate.imgHeight/3)).split('.')[0];
       newUrl = newUrl.replace('/v', '/l_v1655671870:heart.png,x_' + heartX + ',y_' + heartY + '/v');
    }

    const icon: google.maps.Icon = {
       url: newUrl,
       scaledSize: scaledSize
    };

    animate.Marker.setIcon(icon);
  }

  public static getZoomFactor(place: any) {
    var zoomFactor = Number((this.map.getZoom() * 10).toFixed(0));
    var floorNumber = 210;
    var maxNum = .011;

    if (zoomFactor > 190) {
      maxNum = zoomFactor * 0.00014;
    } else if (zoomFactor > 185) {
      maxNum = zoomFactor * 0.00013;
    } else if (zoomFactor > 180) {
      maxNum = zoomFactor * 0.00012;
    } else if (zoomFactor > 175) {
      maxNum = zoomFactor * 0.00011;
    } else if (zoomFactor > 170) {
      maxNum = zoomFactor * 0.00010;    
    } else if (zoomFactor > 165) {
      maxNum = zoomFactor * 0.00008;
    }
      
    const city = this.currentCity; 
    zoomFactor -= (floorNumber - zoomFactor) * 5.5;
    zoomFactor *= .0004;
    zoomFactor = Math.max(0.001, zoomFactor);
    zoomFactor = Math.max(maxNum, zoomFactor);

    if (zoomFactor >= 0.08 && city == 'charleston') {
       zoomFactor *= 2;
    }

    if (place != null) {
      if (place.Address.indexOf('Church') > 0 || place.Address.indexOf('Bay') > 0 || place.Address.indexOf('Battery') > 0) {
        zoomFactor *= 6;
      } else if (place != null && place.Address.indexOf('Broad') > 0) {
        var streetNumber = place.Address.substring(0, 2);
        if (isNaN(streetNumber)) {
          streetNumber = streetNumber.substring(0, 1);
        }
        if (Number(streetNumber) < 47 && Number(streetNumber) % 2 == 1) {
          zoomFactor *= 6;
        } else {
          zoomFactor *= 4;
        }      
      } else {
        zoomFactor *= 4;
      }
    } else {
      zoomFactor *= 4;
    }

    return zoomFactor;
  }

  panToUserLocation() {
    navigator.geolocation.watchPosition(function(position){
      if (this.userLocationMarker != undefined) {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        this.userLocationMarker.position = pos;
      }
    }, function(error){
      // You can detect the reason and alert it; I chose not to.   
      //alert('We could not get your location');
    },{
      // It'll stop looking after an hour. Enabling high accuracy tells it to use GPS if it's available  
      timeout: 5000,
      maximumAge: 600000,
      enableHighAccuracy: true
    });

    if (navigator.geolocation) {
        $('#alert')[0].innerHTML = 'Looking for you...';
        $('#alert').show();
        navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };   
          if (this.userLocationMarker == undefined) {   
            this.userLocationMarker = new google.maps.Marker({
              position: pos,
              icon: 'assets/currentLocation.svg',   
              map: gmc.map
            });
          }
          gmc.map.setCenter(pos);
          $('#alert').hide();
        },
        () => {
          $('#alert').hide();
          this.handleLocationError(true, this.messageInfoWindow, gmc.map.getCenter()!);
        }
      );
    } else {
      // Browser doesn't support Geolocation
      this.handleLocationError(false, this.messageInfoWindow, gmc.map.getCenter()!);
    }
  }

  removeHTML(text: string) {
		return text.replace(/(<([^>]+)>)/ig, '');
	}

  handleLocationError(
    browserHasGeolocation: boolean,
    infoWindow: google.maps.InfoWindow,
    pos: google.maps.LatLng
  ) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
      browserHasGeolocation
        ? "Error: The Geolocation service failed."
        : "Error: Your browser doesn't support geolocation."
    );
    infoWindow.open(gmc.map);
  }

  sendContactEmail() {
    document.location.href = 'mailto:info@changeofscenery.marketing?subject=CoS%20' + gmc.collectionCity + '%20Contact';
    gmc.hideAppMenu();
  }

  toggleBrowseMode() {
    var browseModeElement = document.getElementById("browseMode") as HTMLElement;
    if (gmc.browseMode) {
      browseModeElement.classList.remove('typeSelected');
      browseModeElement.classList.add('typeUnselected');
      gmc.browseMode = false;
    } else {
      browseModeElement.classList.remove('typeUnselected');
      browseModeElement.classList.add('typeSelected');
      gmc.browseMode = true;
    }
  }

  goToMarketing() {
    document.location.href = 'https://changeofscenery.marketing';
    gmc.hideAppMenu();
  }

  goToBoston() {
    document.location.href = 'https://www.changeofscenery.info/boston';
    gmc.hideAppMenu();
  }

  goToCharleston() {
    document.location.href = 'https://www.changeofscenery.info/charleston';
    gmc.hideAppMenu();
  }

  goToWashingtonDC() {
    document.location.href = 'https://www.changeofscenery.info/washingtondc';
    gmc.hideAppMenu();
  }

  showAbout() {
    gmc.hideAppMenu();
    $('#about').css('display', 'block');
    // $('#about').removeClass('hide');
    $('#about').addClass('show');
  }

  public closeAbout() {
    $('#about').removeClass('show');
    // $('#splash').addClass('hide');
    $('#about').css('display', 'none');
  }

  panTour() {
    gmc.map.setCenter({lat: 42.35736, lng: -71.06300});
    gmc.map.setZoom(14.00);
    gmc.map.setTilt(0);
    gmc.map.setHeading(0);
  }

  public static sanitizeName(name) {
    if (name == undefined) { return ""; }
    return name.replaceAll(' ', '').replaceAll("'", "").replaceAll('.', '').replaceAll('’', '').replaceAll('&', '').replaceAll('-', '').replaceAll(',', '').replaceAll('/', '').replaceAll('è', 'e').replaceAll('é', 'e').replaceAll('+', '').replaceAll('ã', 'a');
  }

  public like() {
    const place = gmc.currentPlace;
    const config = require('./config.js');
    const app = initializeApp(config);
    const db = getFirestore(app);
    const placeDoc = doc(db, gmc.collectionCity + '/' + place.id);
    place.Likes++;
    const docData = { Likes: place.Likes };
    try {
      updateDoc(placeDoc, docData);      
      const iconId = gmc.sanitizeName(place.Name);
      const plural = place.Likes != 1 ? 's' : '';
      $('#likeCount' + iconId).text(place.Likes + ' like' + plural);
      var url = gmc.cloudinaryPath + 'icons/' + gmc.sanitizeName(place.Name) + '.png';
      const heartX = String(place.imgWidth/3).split('.')[0];
      const heartY = String(-(place.imgHeight/3)).split('.')[0];          
      url = url.replace('/upload/', '/upload/l_heart/fl_layer_apply,x_' + heartX + ',y_' + heartY + '/');
      const marker = gmc.placeMarkers.find(m => m.getIcon()['url'].indexOf(gmc.sanitizeName(place.Name)) > -1);
      const zoomFactor = gmc.getZoomFactor(place);
      const scaledSize = new google.maps.Size(place.imgWidth * zoomFactor, place.imgHeight * zoomFactor);
      var icon: google.maps.Icon = {
        url: url,
        scaledSize: scaledSize,        
      };
      marker.setIcon(icon);
    } catch (e) {
      console.error("Error updating document: ", e);
    }
}

public unlike() {
    const place = gmc.currentPlace
    const config = require('./config.js');;
    const app = initializeApp(config);
    const db = getFirestore(app);
    const placeDoc = doc(db, gmc.collectionCity + '/' + place.id);
    place.Likes--;
    const docData = { Likes: place.Likes };
    try {
      updateDoc(placeDoc, docData);
      const iconId = gmc.sanitizeName(place.Name);
      gmc.likedPlaces = gmc.likedPlaces.filter(e => e !== iconId)
      const plural = place.Likes != 1 ? 's' : '';
      $('#likeCount' + iconId).text(place.Likes + ' like' + plural);
      var url = gmc.cloudinaryPath + 'icons/' + gmc.sanitizeName(place.Name) + '.png';
      const heartX = String(place.imgWidth/3).split('.')[0];
      const heartY = String(-(place.imgHeight/3)).split('.')[0];          
      url = url.replace('/upload/l_heart/fl_layer_apply,x_' + heartX + ',y_' + heartY + '/', '/upload/');
      const marker = gmc.placeMarkers.find(m => m.getIcon()['url'].indexOf(gmc.sanitizeName(place.Name)) > -1);
      const zoomFactor = gmc.getZoomFactor(place);
      const scaledSize = new google.maps.Size(place.imgWidth * zoomFactor, place.imgHeight * zoomFactor);
      var icon: google.maps.Icon = {
        url: url,
        scaledSize: scaledSize,        
      };
      marker.setIcon(icon);
    } catch (e) {
      console.error("Error updating document: ", e);
    }
}

public toggleType(event) {  
  var typeId = Number(event.srcElement.dataset.typeid);
  var typeClasses = event.srcElement.classList;
  if (typeClasses['1'] == 'typeSelected') {
    typeClasses.remove('typeSelected');
    typeClasses.add('typeUnselected');
    if (typeId == 15) {
      gmc.markerFilter = gmc.markerFilter.filter(f => f !== 12 && f !== 13 && f !== 14);
    } else {
      gmc.markerFilter = gmc.markerFilter.filter(f => f !== typeId);
    }
  } else {
    typeClasses.remove('typeUnselected');
    typeClasses.add('typeSelected');
    if (typeId == 15) {
      gmc.markerFilter.push(12);
      gmc.markerFilter.push(13);
      gmc.markerFilter.push(14);
    } else {
      gmc.markerFilter.push(typeId);    
    }
  }
  gmc.updatePlaceMarkers(false)
}

  async addDocument() {
    const config = require('./config.js');
    const app = initializeApp(config);
    const db = getFirestore(app);          

    this.httpClient.get("assets/charleston/charleston.json").subscribe(data =>{
      const config = require('./config.js');
      const app = initializeApp(config);
      const db = getFirestore(app);          
      var docs:any = data;
      docs.forEach((doc) => {
        var website = doc.Name.substring(doc.Name.indexOf('href') + 5);
        website = website.substring(1, website.indexOf('target') - 2);
        var name = this.removeHTML(doc.Name);
        var address = doc.Address;
        var area = address.indexOf('E Bay') > -1 ? 'Rainbow Row' : address.indexOf('Broad St') > -1 ? 'Broad St' : address.indexOf('E Battery') > -1 ? 'East Battery' : 'Church St';
        var description = doc.Description;
        var notes = doc.Notes;
        var location = new GeoPoint(Number(doc.Latitude),Number(doc.Longitude));
        try {
          var docRef = addDoc(collection(db, "Charleston"), {
            "Name": name,
            "Website": website,
            "Description": description,
            "Address": address,
            "Location": location,
            "Notes": notes,
            "Likes": 0,
            "ImageCount": 1,
            "Area": area
          });  
        } catch (e) {
          console.error("Error adding document: ", e);
        }  
      });
    });
  }
}

