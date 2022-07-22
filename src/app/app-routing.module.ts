import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PanoramaComponent } from './panorama/panorama.component';
import { GoogleMapComponent } from './google-map/google-map.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { TermsOfServiceComponent } from './terms-of-service/terms-of-service.component';

const routes: Routes = [
  { path: '', component: GoogleMapComponent },
  { path: 'google', component: GoogleMapComponent },
  { path: 'charleston', component: GoogleMapComponent },
  { path: 'boston', component: GoogleMapComponent },
  { path: 'washingtondc', component: GoogleMapComponent },
  { path: 'panorama', component: PanoramaComponent },
  { path: 'privacypolicy', component: PrivacyPolicyComponent }, 
  { path: 'termsofservice', component: TermsOfServiceComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
