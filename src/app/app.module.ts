import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { RouteErrorComponent } from './route-error/route-error.component';
import { PanoramaComponent } from './panorama/panorama.component';
import { gmc } from './gmc/gmc';
import { AngularFireModule } from "@angular/fire/compat";
import { firebase, firebaseui, FirebaseUIModule } from 'firebaseui-angular';
import { AngularFireAuthModule } from "@angular/fire/compat/auth";
import { environment } from '../environments/environment';
import * as $ from 'jquery';

const firebaseUiAuthConfig: firebaseui.auth.Config = {
	signInFlow: 'popup',
	signInOptions: [
		firebase.auth.GoogleAuthProvider.PROVIDER_ID,				
		{
			requireDisplayName: false,
			provider: firebase.auth.EmailAuthProvider.PROVIDER_ID
		},
		firebase.auth.TwitterAuthProvider.PROVIDER_ID
	],
	tosUrl: 'https://cambuilt.com/terms-of-service.html',
	privacyPolicyUrl: 'https://cambuilt.com/privacy-policy.html',
	credentialHelper: firebaseui.auth.CredentialHelper.GOOGLE_YOLO
};

@NgModule({
	entryComponents: [
	],

	declarations: [
		AppComponent,
		RouteErrorComponent,
		PanoramaComponent,
  		gmc
	],
	imports: [
		CommonModule,
		BrowserModule,
		BrowserAnimationsModule,
		AppRoutingModule,
		HttpClientModule,
		AngularFireModule.initializeApp(environment.firebaseConfig),
		AngularFireAuthModule,
		FirebaseUIModule.forRoot(firebaseUiAuthConfig)
	],
	providers: [],
	bootstrap: [AppComponent]
})

export class AppModule { }

