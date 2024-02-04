import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'changeofscenery-star',
  templateUrl: './star.component.html',
  styleUrls: ['./star.component.scss']
})
export class StarComponent implements OnInit {
  @Input() star:number;
  @Output() clicked: EventEmitter<number> = new EventEmitter<number>();

  constructor() { }

  ngOnInit(): void {
  }

  clickStars(): void {
    this.clicked.emit(this.star);
  }

}
