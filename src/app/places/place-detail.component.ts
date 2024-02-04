import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IPlace } from '../services/iplace';

@Component({
  templateUrl: './place-detail.component.html',
  styleUrls: ['./place-detail.component.scss']
})
export class PlaceDetailComponent implements OnInit {
  pageTitle: string = 'Product Detail';
  place: IPlace | undefined; // undefined until place is retrieved.

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    // Snapshot: Read the parameter once. 
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.pageTitle += `: ${id}`;

    // Observable: Read emitted parameters as they change.
    this.route.paramMap.subscribe(
      params => console.log(params.get('id'))
    );
  }

  onBack(): void {
    this.router.navigate(['/places']);
  }

}
