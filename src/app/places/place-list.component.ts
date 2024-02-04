import { Component, OnInit } from '@angular/core';
import { IPlace } from '../services/iplace';

@Component({
  templateUrl: './place-list.component.html',
  styleUrls: ['./place-list.component.scss']
})
export class PlaceListComponent implements OnInit {
  selectedPlace: IPlace;
  places: IPlace[] = [];
  showImage = false;
  imageWidth = 60;
  imageMargin = 5;

  constructor() { }

  ngOnInit(): void {
  }

  onClickedStars(stars:number) {
    
  }

}
