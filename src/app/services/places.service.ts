import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IPlace } from './iplace';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private placeUrl = "https://www.changeofscenery.info/api/places";

  constructor(private httpClient: HttpClient) { }

  getPlaces(): Observable<IPlace[]> {
    return this.httpClient.get<IPlace[]>(this.placeUrl).pipe(
      tap(data => console.log(`Places: ${JSON.stringify(data)}`)),
      catchError(this.errorHandler));      
  }

  private errorHandler(err: HttpErrorResponse) {
    let errorMessage = '';
    if (err.error instanceof ErrorEvent) {
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      errorMessage = `Server returned code: ${err.status}, error message is ${err.message}`;
    }
    console.error(errorMessage);
    return throwError(() => errorMessage);
  }
}
