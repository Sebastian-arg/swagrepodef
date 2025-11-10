import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PomodoroService {

  private apiUrl = 'http://localhost:8000/api/pomodoros';

  constructor(private http: HttpClient) { }

  getPomodorosCount(): Observable<number> {
    return this.http.get<{count: number}>(this.apiUrl).pipe(
      map(response => response.count)
    );
  }

  savePomodoro(): Observable<any> {
    return this.http.post(this.apiUrl, {});
  }
}
