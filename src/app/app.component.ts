import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'changeofscenery-root',
	template: `
	<nav class='navbar navbar-expand navbar-light bg-light'>
		<a class='navbar-brand'>{{pageTitle}}</a>
		<ul class='nav nav-pills'>
			<li><a class='nav-link' routerLink="/welcome">Home</a></li>
			<li><a class='nav-link' routerLink="/products">Product List</a></li>
		</ul>
		<div class='container'>
			<router-outlet></router-outlet>
		</div>
	</nav>
	`,
	styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
	pageTitle: string = 'Places';

	ngOnInit() {}

}
