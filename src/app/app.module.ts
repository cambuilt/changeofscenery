import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { RouteErrorComponent } from './route-error/route-error.component';
import { PanoramaComponent } from './panorama/panorama.component';
import { CharlestonComponent } from './charleston/charleston.component';
import { GoogleMapComponent } from './google-map/google-map.component';

@NgModule({
	entryComponents: [
	],

	declarations: [
		AppComponent,
		RouteErrorComponent,
		PanoramaComponent,
		CharlestonComponent,
  		GoogleMapComponent
	],
	imports: [
		CommonModule,
		BrowserModule,
		BrowserAnimationsModule,
		AppRoutingModule,
		HttpClientModule
	],
	providers: [],
	bootstrap: [AppComponent]
})

export class AppModule { }