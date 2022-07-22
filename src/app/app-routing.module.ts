import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PanoramaComponent } from './panorama/panorama.component';
import { GoogleMapComponent } from './google-map/google-map.component';

const routes: Routes = [
  { path: '', component: GoogleMapComponent },
  { path: 'google', component: GoogleMapComponent },
  { path: 'charleston', component: GoogleMapComponent },
  { path: 'boston', component: GoogleMapComponent },
  { path: 'washingtondc', component: GoogleMapComponent },
  { path: 'panorama', component: PanoramaComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
