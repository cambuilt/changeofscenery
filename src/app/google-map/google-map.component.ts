/// <reference types="google.maps" />
import { Component, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, addDoc, updateDoc, getDocs, GeoPoint, query, where } from "firebase/firestore";
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FirebaseUISignInFailure, FirebaseUISignInSuccessWithAuthResult } from 'firebaseui-angular';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword } from "firebase/auth";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: 'changeofscenery-google-map',
  templateUrl: './google-map.component.html',
  styleUrls: ['./google-map.component.scss']
})

export class GoogleMapComponent implements OnInit {
  public static map: google.maps.Map;
  messageInfoWindow: google.maps.InfoWindow;  
  public static lastInfoWindow: google.maps.InfoWindow;
  public static lastCenter;
  public static lastZoomLevel;
  public static lastTilt;
  public static lastHeading;
  public static placeCount = 0; 
  userLocationMarker: google.maps.Marker;
  public static places: any = [];
  public static animations: any = [];
  public static likedPlaces: any = [];
  public static markerFilter: any = [1,2,3,4,6,7,8,9,10,11,13,14];
  public static placeMarkers: google.maps.Marker[] = [];
  public static placeTotal = 0;
  public static streetMarkers: google.maps.Marker[] = [];
  public static cloudinaryPath;
  public static carDriveInterval;
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
  public static carMarkerInfoWindow: google.maps.InfoWindow = new google.maps.InfoWindow({ content: GoogleMapComponent.carinfoWindowContent, minWidth: 320 });
  streetFilter = 'Bay';
  firstTime = true;
  public static collectionCity = 'Boston';
  public static currentCity = "boston";  
  public static currentArea = "";  
  public static currentPlace: any;  
  public static currentUser: any;  
  public static onLanding = true;
  public static zooming = false;
  public static browseMode = false;
  public static sizeMultiple = 76;
  public static cities = [{name:'charleston', displayName: 'Charleston', center:{lat: 32.77600, lng: -79.92900}, heading:-15, zoom:16, tilt:45},
                          {name:'boston', displayName: 'Boston', center:{lat: 42.300, lng: -70.90}, heading:0, zoom:10, tilt:0},
                          {name:'washingtondc',  displayName: 'Washington DC', center:{lat: 38.88500, lng: -77.01900}, heading:0, zoom:14, tilt:0}];  // lat: 38.95636, lng: -77.08440
                          
  public static lastZoom = 0;
  public static updateHouseMarkerCounter = -1;
  public static intervalFunction;
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
        GoogleMapComponent.currentUser = user;
        this.getUser(user);
      } else {
        console.log('no user logged in here');
        GoogleMapComponent.currentUser = null;
      }
    });  

    window['angularComponentReferenceLike'] = { component: this, zone: this.ngZone, loadLike: () => this.like() }; 
    window['angularComponentReferenceUnlike'] = { component: this, zone: this.ngZone, loadUnlike: () => this.unlike() };     
    if (this.route.snapshot.url.length > 0) { 
      this.selectCity(this.route.snapshot.url[0].path);
    }

    GoogleMapComponent.map = new google.maps.Map(document.getElementById("google_map") as HTMLElement, {
        mapTypeControl: false,
        streetViewControl: false,
        keyboardShortcuts: false,
        gestureHandling: 'greedy',
        zoomControl: true,
        fullscreenControl: false,
        mapId: 'd5860e1d98873021'
    });

    GoogleMapComponent.map.addListener('click', (e) => {
      if (GoogleMapComponent.lastInfoWindow != undefined) {
        GoogleMapComponent.lastInfoWindow.close();
        GoogleMapComponent.infoWindowClosing();
      } 
      GoogleMapComponent.lastInfoWindow = undefined;
      this.closeAbout();
      GoogleMapComponent.hideAppMenu();
    });

    GoogleMapComponent.map.addListener('center_changed', () => {         
      if (GoogleMapComponent.zooming == true) {
        return;
      }
      if (GoogleMapComponent.browseMode) {
      }
      if (GoogleMapComponent.suspendUpdate) {
        GoogleMapComponent.suspendUpdate = false;
      } else {
        // GoogleMapComponent.updateHouseMarkers(false);
      }
      // console.log(`center: {lat: ${GoogleMapComponent.map.getCenter().lat()}, lng: ${GoogleMapComponent.map.getCenter().lng()}},`);
      // console.log('zoomLevel', GoogleMapComponent.map.getZoom());
      // console.log('tilt', GoogleMapComponent.map.getTilt());
      // console.log('heading', GoogleMapComponent.map.getHeading());
      window.scroll(0, -100);  
    });

    GoogleMapComponent.map.addListener('zoom_changed', () => {
      if (GoogleMapComponent.zooming == true) {
        setTimeout(function() { GoogleMapComponent.zooming = false; GoogleMapComponent.handleZoom(); }, 500);       
      } else {
        GoogleMapComponent.handleZoom();
      }
    });   
      
    this.messageInfoWindow = new google.maps.InfoWindow();

    if (localStorage.getItem('likedPlaces') != undefined) {
      GoogleMapComponent.likedPlaces = localStorage.getItem('likedPlaces').split(',');      
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
  }

  public logout() {
    this.afAuth.signOut();
    $('firebase-ui').show();
    GoogleMapComponent.hideAppMenu();
    GoogleMapComponent.currentArea = '';
    this.toggleLanding('on');
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
        GoogleMapComponent.currentUser = querySnapshot.docs[0];
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    } else {
      GoogleMapComponent.currentUser = querySnapshot.docs[0];
      if (GoogleMapComponent.currentUser.get('City') != undefined) {
        this.selectCity(GoogleMapComponent.currentUser.get('City'));
      }
    }
  }

  errorCallback(data: FirebaseUISignInFailure) {
    console.warn('errorCallback', data);
  }

  uiShownCallback() {
    console.log('UI shown');
  }

  public async selectCity(cityName) {
    $('#splash').addClass('hide');
    $('#google_map').css('height', '100vh');
    setTimeout(function() { $('#splash').css('display', 'none');$('.backButton').addClass('show');}, 1000);
    const gmc = GoogleMapComponent;
    gmc.currentCity = cityName;
    var icon: google.maps.Icon;
    const city = gmc.currentCity;
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
      icon = {url: 'assets/boston/Hingham.svg',scaledSize: new google.maps.Size(67, 22)};
      gmc.streetMarkers.push(new google.maps.Marker({position: {lat: 42.235, lng: -70.89}, icon: icon, map: gmc.map, zIndex: 100}));
      gmc.streetMarkers[0].addListener('click', () => { gmc.selectArea('Hingham', 42.24199, -70.88947, 19, 284, 66); });
      icon = {url: 'assets/boston/Cohasset.svg',scaledSize: new google.maps.Size(67, 22)};
      gmc.streetMarkers.push(new google.maps.Marker({position: {lat: 42.225, lng: -70.797}, icon: icon, map: gmc.map, zIndex: 100}));
      gmc.streetMarkers[1].addListener('click', () => { gmc.selectArea('Cohasset', 42.2407, -70.80160, 19, 0, 58); });    
      icon = {url: 'assets/boston/Scituate.svg',scaledSize: new google.maps.Size(67, 22)};
      gmc.streetMarkers.push(new google.maps.Marker({position: {lat: 42.18, lng: -70.73}, icon: icon, map: gmc.map, zIndex: 100}));
      gmc.streetMarkers[2].addListener('click', () => { gmc.selectArea('Scituate', 42.194, -70.725, 17, 0, 58); });    
      icon = {url: 'assets/boston/Norwell.svg',scaledSize: new google.maps.Size(67, 22)};
      gmc.streetMarkers.push(new google.maps.Marker({position: {lat: 42.15, lng: -70.80}, icon: icon, map: gmc.map, zIndex: 100}));
      gmc.streetMarkers[3].addListener('click', () => { gmc.selectArea('Norwell', 42.16019, -70.79165, 17, 0, 58); });    
      icon = {url: 'assets/boston/Hull.svg',scaledSize: new google.maps.Size(47, 22)};
      gmc.streetMarkers.push(new google.maps.Marker({position: {lat: 42.27, lng: -70.85}, icon: icon, map: gmc.map, zIndex: 100}));
      gmc.streetMarkers[4].addListener('click', () => { gmc.selectArea('Hull', 42.265, -70.8525, 17, 0, 58); });    
      icon = {url: 'assets/boston/Marshfield.svg',scaledSize: new google.maps.Size(80, 40)};
      gmc.streetMarkers.push(new google.maps.Marker({position: {lat: 42.07, lng: -70.70}, icon: icon, map: gmc.map, zIndex: 100}));
      gmc.streetMarkers[5].addListener('click', () => { gmc.selectArea('Marshfield', 42.095, -70.6817, 13.00, 0, 42); });    
      icon = {url: 'assets/boston/Boston.svg',scaledSize: new google.maps.Size(80, 40)};
      gmc.streetMarkers.push(new google.maps.Marker({position: {lat: 42.346, lng: -71.064}, icon: icon, map: gmc.map, zIndex: 100}));
      gmc.streetMarkers[6].addListener('click', () => { gmc.selectArea('Boston', 42.35736, -71.06300, 14.00, 0, 0); });
      icon = {url: 'assets/boston/BeaconHill.svg',scaledSize: new google.maps.Size(80, 40)};
      gmc.streetMarkers.push(new google.maps.Marker({position: {lat: 42.355, lng: -71.069}, icon: icon, map: gmc.map, zIndex: 100, visible: false}));
      gmc.streetMarkers[7].addListener('click', () => { gmc.selectArea('Beacon Hill', 42.35666, -71.06944, 18.75, 0, 0); });
      icon = {url: 'assets/boston/Downtown.svg',scaledSize: new google.maps.Size(80, 40)};
      gmc.streetMarkers.push(new google.maps.Marker({position: {lat: 42.3600, lng: -71.0570}, icon: icon, map: gmc.map, zIndex: 100, visible: false}));
      gmc.streetMarkers[8].addListener('click', () => { gmc.selectArea('Downtown', 42.3614, -71.0572, 18.75, 0, 0); });
      icon = {url: 'assets/boston/NorthEnd.svg',scaledSize: new google.maps.Size(80, 40)};
      gmc.streetMarkers.push(new google.maps.Marker({position: {lat: 42.3630, lng: -71.05435}, icon: icon, map: gmc.map, zIndex: 100, visible: false}));
      gmc.streetMarkers[9].addListener('click', () => { gmc.selectArea('North End', 42.36380, -71.05564, 18.75, 297, 54); });
    } else if (city == 'charleston') {
      icon = {url: 'assets/charleston/RainbowRow.svg',scaledSize: new google.maps.Size(120, 40)};
      gmc.streetMarkers.push(new google.maps.Marker({position: {lat: 32.77535, lng: -79.92660}, icon: icon, map: gmc.map, zIndex: 100}));
      gmc.streetMarkers[0].addListener('click', () => { gmc.selectArea('RainbowRow', 32.77580, -79.92740, 21, 327, 90); });
      icon = {url: 'assets/charleston/EastBaySt.svg',scaledSize: new google.maps.Size(120, 40)};
      gmc.streetMarkers.push(new google.maps.Marker({position: {lat: 32.77380, lng: -79.92730}, icon: icon, map: gmc.map, zIndex: 100}));
      gmc.streetMarkers[1].addListener('click', () => { gmc.selectArea('EastBaySt', 32.77355, -79.92752, 21, 348, 64); });
      icon = {url: 'assets/charleston/EastBattery.svg',scaledSize: new google.maps.Size(120, 40)};
      gmc.streetMarkers.push(new google.maps.Marker({position: {lat: 32.77130, lng: -79.92780}, icon: icon, map: gmc.map, zIndex: 150}));
      gmc.streetMarkers[2].addListener('click', () => { gmc.selectArea('EastBattery', 32.77095, -79.92823, 21, 3, 49); });
      icon = {url: 'assets/charleston/ChurchSt.svg', scaledSize: new google.maps.Size(120, 40)};
      gmc.streetMarkers.push(new google.maps.Marker({position: {lat: 32.77230, lng: -79.92930}, icon: icon, map: gmc.map, zIndex: 100}));
      gmc.streetMarkers[3].addListener('click', () => { gmc.selectArea('ChurchSt', 32.771321, -79.92938, 21, 344, 67); });
      icon = {url: 'assets/charleston/BroadSt.svg',scaledSize: new google.maps.Size(120, 40)};
      gmc.streetMarkers.push(new google.maps.Marker({position: {lat: 32.77635, lng: -79.92920}, icon: icon, map: gmc.map, zIndex: 100}));
      gmc.streetMarkers[4].addListener('click', () => { gmc.selectArea('BroadSt', 32.77656, -79.93001, 19, 285, 67); });
    } else if (city == 'washingtondc') {
      icon = {url: 'assets/washingtondc/CityCenter.svg',scaledSize: new google.maps.Size(67, 22)};
      gmc.streetMarkers.push(new google.maps.Marker({position: {lat: 38.90010, lng: -77.02600}, icon: icon, map: GoogleMapComponent.map, zIndex: 100}));
      gmc.streetMarkers[0].addListener('click', () => { gmc.selectArea('City Center', 38.90056, -77.02513, 17, 360, 40); });
      icon = {url: 'assets/washingtondc/Chinatown.svg',scaledSize: new google.maps.Size(67, 22)};
      gmc.streetMarkers.push(new google.maps.Marker({position: {lat: 38.90010, lng: -77.0195}, icon: icon, map: GoogleMapComponent.map, zIndex: 100}));
      gmc.streetMarkers[1].addListener('click', () => { gmc.selectArea('Chinatown', 38.90056, -77.021, 17, 360, 40); });
      icon = {url: 'assets/washingtondc/PennQuarter.svg',scaledSize: new google.maps.Size(67, 22)};
      gmc.streetMarkers.push(new google.maps.Marker({position: {lat: 38.89731, lng: -77.02291}, icon: icon, map: GoogleMapComponent.map, zIndex: 100}));
      gmc.streetMarkers[2].addListener('click', () => { gmc.selectArea('Penn Quarter', 38.89681, -77.0243, 18, 360, 40); });
      icon = {url: 'assets/washingtondc/FriendshipHeights.svg',scaledSize: new google.maps.Size(100, 22)};
      gmc.streetMarkers.push(new google.maps.Marker({position: {lat: 38.96077, lng: -77.08574}, icon: icon, map: GoogleMapComponent.map, zIndex: 100}));
      gmc.streetMarkers[3].addListener('click', () => { gmc.selectArea('Friendship Heights', 38.95930, -77.08574, 16, 360, 40); });
    }  

    const config = require('./config.js');
    const app = initializeApp(config);
    const db = getFirestore(app);
    const docRef = doc(db, "User", GoogleMapComponent.currentUser.id);
    await updateDoc(docRef, { City:  cityName});
  }

  public static async handleZoom() {
    if (this.currentArea == '') {
      return;
    }    

    const zoom = this.map.getZoom();    

    if (zoom > 11 || (this.currentArea == 'Marshfield' && zoom > 11)) {
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
                GoogleMapComponent.places.push(doc.data());
                GoogleMapComponent.places[GoogleMapComponent.places.length - 1]['id'] = doc.id;
            });
          } catch (e) {
            //$('#loading').removeClass('show');
            // $('#loading').hide();
            console.error("Error loading places: ", e);
            alert('Cannot get places, maybe due to weak Internet connection.');
          }      
          this.updateHouseMarkers(true);
        } else {
          this.updateHouseMarkers(true);
        }
      } else {        
        this.updateHouseMarkers(true);
      }
    } else if (this.placeTotal > 0) {      
      this.clearHouseMarkers();
      this.toggleLanding('on');
    }
    // $('#loading').removeClass('show');
    // $('#loading').hide();
  }

  public static updateHouseMarkers(zooming:boolean) {
    GoogleMapComponent.updateHouseMarkerCounter++;
    const city = GoogleMapComponent.currentCity;

    this.places.forEach(place => {
      const marker = GoogleMapComponent.placeMarkers.find(m => m.getTitle() == place.Name);
      if (GoogleMapComponent.markerFilter.find(m => m == place.Type) != undefined) {
        if (place.Area == this.currentArea || city == 'charleston' || (this.currentArea == 'Marshfield' && place.Area == 'Brant Rock')) {
          if (marker == undefined) {
              this.placeTotal++;
              this.createMarker(place);            
          } else {            
            marker.setMap(GoogleMapComponent.map);
            GoogleMapComponent.updateIcon(place, marker, false);
          }
        } else if (marker != null) {
          marker.setMap(null);
        }      
      } else if (marker != undefined && place.Name != undefined) {
        console.log('set map to null for place', place);
        marker.setMap(null);
      }
    });

    this.animations.forEach(animate => {
      GoogleMapComponent.updateAnimateIcon(animate);      
    });
  }

  public static createMarker(place: any) {    
    const zoomFactor = this.getZoomFactor(place);
    const iconId = this.sanitizeName(place.Name);
    var img = new Image();

    img.onload = function() {
      const city = GoogleMapComponent.currentCity; 
      place['imgWidth'] = img.width;
      place['imgHeight'] = img.height;
      var name = city == 'charleston' ? place.Address : GoogleMapComponent.sanitizeName(place.Name);
      var scaledSize = new google.maps.Size(img.width * zoomFactor, img.height * zoomFactor);      
      var url = GoogleMapComponent.cloudinaryPath + 'icons/' + name + '.png';
      var heartIcon = 'heart_empty';
      var likesText = place.Likes == 0 ? '0 likes' : place.Likes == 1 ? '1 like' : place.Likes + ' likes';

      if (GoogleMapComponent.likedPlaces.length > 0) {        
        if (GoogleMapComponent.likedPlaces.find(x => x == iconId) != undefined) {
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
        url = GoogleMapComponent.cloudinaryPath + 'icons/Sprites' + place.SpriteIndex + '.png';
        icon = { url: url, origin: origin, size: size, scaledSize: scaledSize };
      } 

      var n = place.Name;
      var animated = n == 'Boston North End' || n == 'Hingham MA' || n == 'Cohasset MA' || n == 'Scituate MA' || n == 'Boston Beacon Hill' || n == 'Hull MA' || n == 'Marshfield MA' || n == 'Norwell MA' || n == 'City Center' ? google.maps.Animation.DROP : null;
      var zIndex = place.ZIndex == undefined ? 0 : place.ZIndex;

      const placeMarker = new google.maps.Marker({
        position: {lat: Number(place.Location.latitude), lng: Number(place.Location.longitude)},
        title: place.Name,
        icon: icon,
        optimized: true,
        animation: animated,
        map: GoogleMapComponent.map,
        zIndex: zIndex
      });

      const infoWindowTitle = place.Website == '' ? place.Name : `<a href='${place.Website}' target='_blank'>${place.Name}</a>`;
      const startingImageIndex = city.indexOf('washington') > -1 ? "1" : "";
      const width = document.body.clientWidth || document.body.clientHeight < 400 ? "300px" : "490px";
      const bgWidth = document.body.clientWidth || document.body.clientHeight < 400 ? "320px" : "520px";
      const imageCount = place.ImageCount > 1 ? '1/' + place.ImageCount : '';
      var contentString = `<div style='padding:7px;'><div id='imageCount'>${imageCount}</div><table style='width:${width};padding-right:0px;background-color:white;'><tr><td class='photo' style='padding:0px;margin:0px;vertical-align:top'>` + 
      `<table><tr style='height:20%;'><td><img id='${iconId}' src='${GoogleMapComponent.cloudinaryPath + iconId}${startingImageIndex}.png' style='box-shadow:0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);margin-right:0.5em;' ` + 
      `width='180px' height='180px' onclick='scrollImage("${GoogleMapComponent.cloudinaryPath}","${iconId}",${place.ImageCount})'/></td>` + 
      `<td style='vertical-align:top;'><table><tr><td style='height:20px;margin:0px;'><h3>${infoWindowTitle}</h3></td><td></td></tr>` + 
      `<tr><td><span style='font-weight:700;font-size:12px;'>${place.Address.replace(', ' + GoogleMapComponent.currentArea, '')}</span></td><td></td></tr>` + 
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
        GoogleMapComponent.infoWindowClosing();
      });
      let map = GoogleMapComponent.map;
  
      placeMarker.addListener('click', () => {
        GoogleMapComponent.hideAppMenu();              
        GoogleMapComponent.currentPlace = place;
        GoogleMapComponent.lastCenter = GoogleMapComponent.map.getCenter();
        GoogleMapComponent.lastZoomLevel = GoogleMapComponent.map.getZoom();
        GoogleMapComponent.lastTilt = GoogleMapComponent.map.getTilt();
        GoogleMapComponent.lastHeading = GoogleMapComponent.map.getHeading();
        // houseMarker.setAnimation(google.maps.Animation.BOUNCE);
        // setTimeout(function () {houseMarker.setAnimation(null);}, 500);
        if (GoogleMapComponent.onLanding == true) {
          return;
        }
        if (GoogleMapComponent.lastInfoWindow != undefined) {
          GoogleMapComponent.lastInfoWindow.close();
        } 
        GoogleMapComponent.lastInfoWindow = markerInfoWindow;            
        var anchor: google.maps.MVCObject = new google.maps.MVCObject(); 
        let latDelta = city == 'boston' ? 0.000 : 0.004;
        let lngDelta = city == 'boston' ? 0.000 : -0.003;
        anchor.set('position', {lat: placeMarker.getPosition().lat() + (latDelta / GoogleMapComponent.map.getZoom()), lng: placeMarker.getPosition().lng() + (lngDelta / GoogleMapComponent.map.getZoom())});
        GoogleMapComponent.updateHouseMarkers(false);
        GoogleMapComponent.suspendUpdate = true;
        var selectIcon = n == 'Boston North End' || n == 'Hingham MA' || n == 'Cohasset MA' || n == 'Scituate MA' || n == 'Boston Beacon Hill' || n == 'Hull MA' || n == 'Marshfield MA' || n == 'Norwell MA' || n == 'City Center' || n == 'Chinatown' || n == 'Penn Quarter';
        GoogleMapComponent.updateIcon(place, placeMarker, selectIcon);
        markerInfoWindow.open({anchor: anchor, map, shouldFocus: false});        
        setTimeout(function () {
          const iconId = GoogleMapComponent.sanitizeName(place.Name);  
          if (GoogleMapComponent.likedPlaces.find(x => x == iconId) != undefined) {
            $('#likedHeart' + iconId).attr('src', 'assets/heart.png');
          }
          if (GoogleMapComponent.currentPlace.Likes > 0) {
            const plural = GoogleMapComponent.currentPlace.Likes != 1 ? 's' : '';
            $('#likeCount' + iconId).text(GoogleMapComponent.currentPlace.Likes + ' like' + plural);
          }
        }, 50);
      });

      GoogleMapComponent.placeMarkers.push(placeMarker);
      GoogleMapComponent.placeCount++;

      if (GoogleMapComponent.placeCount == GoogleMapComponent.placeTotal) {
        setTimeout(function() {
         $('#loading').removeClass('show');
        }, 2000);
      }
    }

    var name = GoogleMapComponent.currentCity == 'charleston' ? place.Address : this.sanitizeName(place.Name);

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

  public hideAppMenu() {
    GoogleMapComponent.hideAppMenu();
  }

  public static hideAppMenu() {
    $('.appMenu').addClass('close');
    $('.appMenu').removeClass('open');
    $('#mapLogo').show();
  }
  
  public hideSplash() {
    $('#splash').addClass('hide');
    $('#splash').css('display', 'none');
  }

  public static selectArea(areaName, lat, lng, zoom, heading, tilt) {
    $('#loading').addClass('show');
    GoogleMapComponent.placeCount = 0;
    this.currentArea = areaName;
    this.onLanding = false;
    this.zooming = true;    
    this.map.setCenter({lat: lat, lng: lng});
    this.map.setZoom(zoom);    
    this.map.setTilt(tilt);
    this.map.setHeading(heading); 
    this.toggleLanding('off');
    GoogleMapComponent.hideAppMenu();
    
    if (areaName == 'Boston') {
      this.streetMarkers.find(x => x.getIcon()['url'].indexOf('Boston') > -1).setVisible(false);
      if (zoom > 13 && zoom < 16 && lat > 40) {
        var index = 6;
        while(index++<9)
        {
          this.streetMarkers[index].setVisible(true);
        }
      }
    } else {           
      if (this.currentCity == 'washingtondc') {
        this.streetMarkers.forEach(streetMarker => {
          streetMarker.setVisible(false);
        });
      } else {
        this.streetMarkers.find(x => x.getIcon()['url'].indexOf(areaName.replace(' ', '')) > -1).setVisible(false);
      }
      if (areaName == 'North End') {
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
      } else if (areaName == 'City Center' || areaName == 'Chinatown' || areaName == 'Penn Quarter') {
        setTimeout(function() {
          GoogleMapComponent.startAnimation();
        }, 2000);
      }
    }
  }

  public static async startAnimation() {
    this.stopAnimation = false;
    const zoomFactor = this.getZoomFactor(null);
    const config = require('./config.js');
    const app = initializeApp(config);
    const db = getFirestore(app);
    const querySnapshot = await getDocs(collection(db, this.collectionCity + 'Animated'));
    const city = GoogleMapComponent.currentCity; 
    
    querySnapshot.forEach((doc) => {
      const animation = doc.data();
      if (animation.Area == GoogleMapComponent.currentArea) {
        this.animations.push(doc.data());
        this.animations[this.animations.length - 1]['id'] = doc.id;      
      }
    });

    this.animations.forEach(animation => {
      var img = new Image();

      img.onload = function() {
        const iconId = GoogleMapComponent.sanitizeName(animation.Name);
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
          map: GoogleMapComponent.map,
          zIndex: zIndex
        });

        const width = document.body.clientWidth || document.body.clientHeight < 400 ? "300px" : "490px";
        const contentString = `<div style='padding:7px;'><table style='width:${width};padding-right:0px;background-color:white;'><tr><td class='photo' style='padding:0px;margin:0px;vertical-align:top'>` + 
        `<table><tr style='height:20%;'><td><img id='${iconId}' src='${GoogleMapComponent.cloudinaryPath + iconId}.png' style='box-shadow:0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);margin-right:0.5em;' ` + 
        `width='180px' height='180px' onclick='scrollImage("${GoogleMapComponent.cloudinaryPath}","${iconId}",1)'/></td>` + 
        `<td style='vertical-align:top;'><table><tr><td style='height:20px;margin:0px;'><h3>${animation.Name}</a></h3></td><td></td></tr>` + 
        `<tr><td><span style='font-weight:700;font-size:12px;'></td><td></td></tr><tr><td class='descriptionInfoWindow'>` + 
        `<img id='likedHeart${iconId}' src='assets/heart_empty.png' style="width:24px;margin-bottom:6px;cursor:pointer;" onclick='toggleLike("${iconId}", "${animation.id}");'/><span id='likeCount${iconId}' style="position:relative;bottom:4px;left:4px;">0 likes</span><br style="margin-bottom:32px;"/>${animation.Description}</td></tr>` + 
        `<tr><td style='height:10px;'></td></tr><tr><td class='zillow'>&nbsp;</td></tr><tr><td>&nbsp;</td></tr></table></td></tr></table>` +
        `<tr colspan="2" style="height:80%;"><td class="notes">${animation.Notes}</td></tr></table>` + 
        `</td></tr><tr><td></td></tr></table></div>`;  
        const markerInfoWindow: google.maps.InfoWindow = new google.maps.InfoWindow({ content: contentString, minWidth: 320 });
        
        markerInfoWindow.addListener('closeclick', () => {
          GoogleMapComponent.infoWindowClosing();
        });
        let map = GoogleMapComponent.map;
    
        animation.Marker.addListener('click', () => {              
          GoogleMapComponent.lastCenter = GoogleMapComponent.map.getCenter();
          GoogleMapComponent.lastZoomLevel = GoogleMapComponent.map.getZoom();
          GoogleMapComponent.lastTilt = GoogleMapComponent.map.getTilt();
          GoogleMapComponent.lastHeading = GoogleMapComponent.map.getHeading();
          if (GoogleMapComponent.onLanding == true) {
            return;
          }
          if (GoogleMapComponent.lastInfoWindow != undefined) {
            GoogleMapComponent.lastInfoWindow.close();
          } 
          GoogleMapComponent.lastInfoWindow = markerInfoWindow;            
          var anchor: google.maps.MVCObject = new google.maps.MVCObject(); 
          let latDelta = city == 'boston' ? 0.000 : 0.004;
          let lngDelta = city == 'boston' ? 0.000 : -0.003;
          anchor.set('position', {lat: animation.Marker.getPosition().lat() + (latDelta / GoogleMapComponent.map.getZoom()), lng: animation.Marker.getPosition().lng() + (lngDelta / GoogleMapComponent.map.getZoom())});
          GoogleMapComponent.updateHouseMarkers(false);
          GoogleMapComponent.suspendUpdate = true;
          markerInfoWindow.open({anchor: anchor, map, shouldFocus: false});        
        });

        animation['AnimationCounter'] = 0;
        if (animation.Name == 'Uber') {
          GoogleMapComponent.animateUber = animation;
        } else {
          GoogleMapComponent.animateMarker(animation, 0);
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
        setTimeout(function () { GoogleMapComponent.animateMarker(animate, animationIndex) }, this.delay);
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
                  GoogleMapComponent.animateWaitingMoveIndex++;
                  GoogleMapComponent.animateCatchingUpMoveIndex++;
                  GoogleMapComponent.animateMarker(GoogleMapComponent.animateWaiting, GoogleMapComponent.animateWaitingMoveIndex);
                  GoogleMapComponent.animateMarker(GoogleMapComponent.animateCatchingUp, GoogleMapComponent.animateCatchingUpMoveIndex);                 
                }, animation.dur * 1000);
              }, timeToWait);
            }
          } else if (animation.att == 'WomanSwapBags') {
            url = `${GoogleMapComponent.cloudinaryPath}WellDressedWomanStraightArms.png`;
            url = url.replace('/upload/', `/upload/l_hermesbg/fl_layer_apply,x_${animation.attx},y_${animation.atty}/`);
            url = url.replace('/upload/', `/upload/l_tiffany_bag/fl_layer_apply,x_60,y_140/`);
          } else if (animation.att == 'ManSwapBags') {
            url = `${GoogleMapComponent.cloudinaryPath}WellDressedMan.png`;
            url = url.replace('/upload/', `/upload/l_boss_bag/fl_layer_apply,x_${animation.attx},y_${animation.atty}/`);
          } else if (animation.att == 'CallUber') {
            GoogleMapComponent.animateMarker(GoogleMapComponent.animateUber, 0);
          } else if (animation.att == 'CarArrived') { 
            GoogleMapComponent.resumingMovement = true;
            GoogleMapComponent.animateWaitingMoveIndex += 6;
            GoogleMapComponent.animateCatchingUpMoveIndex += 6;
            GoogleMapComponent.animateMarker(GoogleMapComponent.animateWaiting, GoogleMapComponent.animateWaitingMoveIndex);
            GoogleMapComponent.animateMarker(GoogleMapComponent.animateCatchingUp, GoogleMapComponent.animateCatchingUpMoveIndex);
          } else if (animation.att == 'Restart') {          
            this.animateRestart = true;
          } else if (animation.att == 'RemoveAttachment') {
            if (url.indexOf('StyleandFlair') > -1) {
              url = GoogleMapComponent.cloudinaryPath + 'StyleandFlair.png';
            } else if (url.indexOf('CapriandButtonDown') > -1) {
              url = GoogleMapComponent.cloudinaryPath + 'CapriandButtonDown.png';
            }
          } else if (animation.att == 'BigHeads') {
            url = url.replace('CapriandButtonDown', 'CapriandButtonDownBigHeads');  
          } else {
            const cloudinaryCity = GoogleMapComponent.cloudinaryPath.split('/')[GoogleMapComponent.cloudinaryPath.split('/').length - 2];
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
            if (GoogleMapComponent.animateRestart == true) {
              GoogleMapComponent.animateWaiting = undefined;
              GoogleMapComponent.animateCatchingUp = undefined;
              GoogleMapComponent.animateWaitingMoveIndex = 0;
              GoogleMapComponent.animateCatchingUpMoveIndex = 0;
              GoogleMapComponent.animateRestart = false;
              const zoomFactor = GoogleMapComponent.getZoomFactor(null);
              GoogleMapComponent.animations.forEach(animate => {
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
                    GoogleMapComponent.animateUber = animate;
                  } else {
                    GoogleMapComponent.animateMarker(animate, 0);
                  }  
                };        
                if (animate.Name == 'Uber') {
                  const seconds = new Date().getSeconds();
                  const carName = seconds % 2 == 0 ? 'RollsRoyceUber' : 'CadillacUber';
                  img.src = GoogleMapComponent.cloudinaryPath + carName + '.png';
                } else {
                  img.src = GoogleMapComponent.cloudinaryPath + GoogleMapComponent.sanitizeName(animate.Name) + '.png';
                }
              });
            } else {
              if (animationIndex < animations.length - 1) {
                animationIndex++;
                animate.Marker.setVisible(true);
                GoogleMapComponent.animateMarker(animate, animationIndex);
              }
            }  
          }, animation.dur * 1000);
        }
      }
    } else if (animation.cmd == 'break') {
    }
  }

  public toggleLanding(onOff) {
    GoogleMapComponent.stopAnimation = true;
    GoogleMapComponent.animations.forEach(animation => {
      animation.Marker.setMap(null);
    });
    GoogleMapComponent.animations = [];
    if (onOff == 'on' && GoogleMapComponent.currentArea == '') {
      $('#google_map').css('height', '0vh');      
    }
    if (GoogleMapComponent.currentArea == '') {
      $('#splash').removeClass('hide');
      $('#splash').css('display', 'flex');  
      $('.backButton').removeClass('show');
      return;
    }
    if (onOff == 'on' && GoogleMapComponent.currentArea == 'Boston') {
      GoogleMapComponent.streetMarkers.forEach(streetMarker => {
        const url = streetMarker.getIcon()['url'];
        if (url.indexOf('BeaconHill') > -1 || url.indexOf('Downtown') > -1 || url.indexOf('NorthEnd') > -1 ) {
          streetMarker.setVisible(false);
        }
      });
    } else {
      $('.backButton').addClass('show');
    }
    GoogleMapComponent.toggleLanding(onOff);
  }

  public static toggleLanding(onOff) {    
    const city = this.currentCity; 

    if (onOff == 'on') {
      if (city == 'boston' && (this.currentArea == 'Beacon Hill' || this.currentArea == 'Downtown' || this.currentArea == 'North End')) {
        this.clearHouseMarkers();
        this.onLanding = false;
        this.zooming = true;    
        this.map.setCenter({lat: 42.35736, lng: -71.06300});
        this.map.setZoom(14.00);    
        this.map.setTilt(0);
        this.map.setHeading(0); 
        var index = 6;    
        while(index++<9)
        {
          this.streetMarkers[index].setVisible(true);
        }
        this.streetMarkers[6].setVisible(false);
        this.onLanding = onOff == 'on';
        this.currentArea = 'Boston';
      } else {
        if (this.currentArea == 'Boston') {
          this.streetMarkers.find(x => x.getIcon()['url'].indexOf('Boston') > -1).setVisible(true);
        } else {
          this.streetMarkers.find(x => x.getIcon()['url'].indexOf(this.currentArea.replace(' ', '')) > -1).setVisible(true);
        }
        this.currentArea = '';
        this.zooming = true;
        this.map.setCenter(this.cities.find(x => x.name == city).center);
        this.map.setZoom(this.cities.find(x => x.name == city).zoom);
        this.map.setHeading(this.cities.find(x => x.name == city).heading);
        this.map.setTilt(this.cities.find(x => x.name == city).tilt);
        this.updateHouseMarkerCounter = -1;
        this.clearHouseMarkers();
        this.placeMarkers = [];
        this.places = [];
        var index = 6;
        if (this.currentArea == 'Boston') {
          while(index++<9)
          {
            this.streetMarkers[index].setVisible(false);
          }
        } else if (this.currentArea == 'Beacon Hill' || this.currentArea == 'Downtown' || this.currentArea == 'North End') {
          this.currentArea = 'Boston';
          this.onLanding = false;
          this.zooming = true;    
          this.map.setCenter({lat: 42.35736, lng: -71.06300});
          this.map.setZoom(14.00);
          this.map.setTilt(0);
          this.map.setHeading(0);
          this.toggleLanding('off');
          var index = 6;
          while(index++<9)
          {
            this.streetMarkers[index].setVisible(true);
          }      
        } else {
          this.streetMarkers.forEach(streetMarker => {
            streetMarker.setVisible(true);
          });  
        }
      }
    } else {
      this.zooming = false;      
    }
    this.onLanding = onOff == 'on';
    if (this.lastInfoWindow != undefined) {
      this.lastInfoWindow.close();
      this.lastInfoWindow = undefined;
    } 
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
              map: GoogleMapComponent.map
            });
          }
          GoogleMapComponent.map.setCenter(pos);
          $('#alert').hide();
        },
        () => {
          $('#alert').hide();
          this.handleLocationError(true, this.messageInfoWindow, GoogleMapComponent.map.getCenter()!);
        }
      );
    } else {
      // Browser doesn't support Geolocation
      this.handleLocationError(false, this.messageInfoWindow, GoogleMapComponent.map.getCenter()!);
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
    infoWindow.open(GoogleMapComponent.map);
  }

  sendContactEmail() {
    document.location.href = 'mailto:info@changeofscenery.marketing?subject=CoS%20' + GoogleMapComponent.collectionCity + '%20Contact';
    GoogleMapComponent.hideAppMenu();
  }

  toggleBrowseMode() {
    var browseModeElement = document.getElementById("browseMode") as HTMLElement;
    if (GoogleMapComponent.browseMode) {
      browseModeElement.classList.remove('typeSelected');
      browseModeElement.classList.add('typeUnselected');
      GoogleMapComponent.browseMode = false;
    } else {
      browseModeElement.classList.remove('typeUnselected');
      browseModeElement.classList.add('typeSelected');
      GoogleMapComponent.browseMode = true;
    }
  }

  goToMarketing() {
    document.location.href = 'https://changeofscenery.marketing';
    GoogleMapComponent.hideAppMenu();
  }

  goToBoston() {
    document.location.href = 'https://www.changeofscenery.info/boston';
    GoogleMapComponent.hideAppMenu();
  }

  goToCharleston() {
    document.location.href = 'https://www.changeofscenery.info/charleston';
    GoogleMapComponent.hideAppMenu();
  }

  goToWashingtonDC() {
    document.location.href = 'https://www.changeofscenery.info/washingtondc';
    GoogleMapComponent.hideAppMenu();
  }

  showAbout() {
    GoogleMapComponent.hideAppMenu();
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
    GoogleMapComponent.map.setCenter({lat: 42.35736, lng: -71.06300});
    GoogleMapComponent.map.setZoom(14.00);
    GoogleMapComponent.map.setTilt(0);
    GoogleMapComponent.map.setHeading(0);
  }

  public static sanitizeName(name) {
    if (name == undefined) { return ""; }
    return name.replaceAll(' ', '').replaceAll("'", "").replaceAll('.', '').replaceAll('’', '').replaceAll('&', '').replaceAll('-', '').replaceAll(',', '').replaceAll('/', '').replaceAll('è', 'e').replaceAll('é', 'e').replaceAll('+', '').replaceAll('ã', 'a');
  }

  public like() {
    const place = GoogleMapComponent.currentPlace;
    const config = require('./config.js');
    const app = initializeApp(config);
    const db = getFirestore(app);
    const placeDoc = doc(db, GoogleMapComponent.collectionCity + '/' + place.id);
    place.Likes++;
    const docData = { Likes: place.Likes };
    try {
      updateDoc(placeDoc, docData);      
      const iconId = GoogleMapComponent.sanitizeName(place.Name);
      const plural = place.Likes != 1 ? 's' : '';
      $('#likeCount' + iconId).text(place.Likes + ' like' + plural);
      var url = GoogleMapComponent.cloudinaryPath + 'icons/' + GoogleMapComponent.sanitizeName(place.Name) + '.png';
      const heartX = String(place.imgWidth/3).split('.')[0];
      const heartY = String(-(place.imgHeight/3)).split('.')[0];          
      url = url.replace('/upload/', '/upload/l_heart/fl_layer_apply,x_' + heartX + ',y_' + heartY + '/');
      const marker = GoogleMapComponent.placeMarkers.find(m => m.getIcon()['url'].indexOf(GoogleMapComponent.sanitizeName(place.Name)) > -1);
      const zoomFactor = GoogleMapComponent.getZoomFactor(place);
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
    const place = GoogleMapComponent.currentPlace
    const config = require('./config.js');;
    const app = initializeApp(config);
    const db = getFirestore(app);
    const placeDoc = doc(db, GoogleMapComponent.collectionCity + '/' + place.id);
    place.Likes--;
    const docData = { Likes: place.Likes };
    try {
      updateDoc(placeDoc, docData);
      const iconId = GoogleMapComponent.sanitizeName(place.Name);
      GoogleMapComponent.likedPlaces = GoogleMapComponent.likedPlaces.filter(e => e !== iconId)
      const plural = place.Likes != 1 ? 's' : '';
      $('#likeCount' + iconId).text(place.Likes + ' like' + plural);
      var url = GoogleMapComponent.cloudinaryPath + 'icons/' + GoogleMapComponent.sanitizeName(place.Name) + '.png';
      const heartX = String(place.imgWidth/3).split('.')[0];
      const heartY = String(-(place.imgHeight/3)).split('.')[0];          
      url = url.replace('/upload/l_heart/fl_layer_apply,x_' + heartX + ',y_' + heartY + '/', '/upload/');
      const marker = GoogleMapComponent.placeMarkers.find(m => m.getIcon()['url'].indexOf(GoogleMapComponent.sanitizeName(place.Name)) > -1);
      const zoomFactor = GoogleMapComponent.getZoomFactor(place);
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
      GoogleMapComponent.markerFilter = GoogleMapComponent.markerFilter.filter(f => f !== 12 && f !== 13 && f !== 14);
    } else {
      GoogleMapComponent.markerFilter = GoogleMapComponent.markerFilter.filter(f => f !== typeId);
    }
  } else {
    typeClasses.remove('typeUnselected');
    typeClasses.add('typeSelected');
    if (typeId == 15) {
      GoogleMapComponent.markerFilter.push(12);
      GoogleMapComponent.markerFilter.push(13);
      GoogleMapComponent.markerFilter.push(14);
    } else {
      GoogleMapComponent.markerFilter.push(typeId);    
    }
  }
  GoogleMapComponent.updateHouseMarkers(false)
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


