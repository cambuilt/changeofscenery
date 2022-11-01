import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PanoramaComponent } from './panorama/panorama.component';
import { gmc } from './gmc/gmc';

const routes: Routes = [
  { path: '', component: gmc },
  { path: 'google', component: gmc },
  { path: 'charleston', component: gmc },
  { path: 'boston', component: gmc },
  { path: 'washingtondc', component: gmc },
  { path: 'washingtondc/kiosk', component: gmc },
  { path: 'panorama', component: PanoramaComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
