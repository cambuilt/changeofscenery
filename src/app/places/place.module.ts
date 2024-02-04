import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaceListComponent } from './place-list.component';
import { PlaceDetailComponent } from './place-detail.component';
import { StarComponent } from '../helpers/star.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PlaceDetailGuard } from './place-detail.guard';

@NgModule({
  declarations: [
    PlaceListComponent,
    PlaceDetailComponent, 
    StarComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      { path: 'places', component: PlaceListComponent },
			{ 
				path: 'places/:id',
				canActivate: [PlaceDetailGuard],
				component: PlaceDetailComponent 
			}
    ])
  ]
})

export class PlaceModule { }
