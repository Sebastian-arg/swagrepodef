import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PomodoroService {

  private apiUrl = 'http://localhost:8000/api/pomodoros';

  constructor(private http: HttpClient) { }

  savePomodoro(): Observable<any> {
    return this.http.post(this.apiUrl, {});
  }
}
