import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TareasService {

  private apiUrl = 'http://localhost:8000/api/tareas';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  getTareas(): Observable<any> {
    return this.http.get(this.apiUrl, this.getHeaders());
  }

  getTarea(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, this.getHeaders());
  }

  crearTarea(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data, this.getHeaders());
  }

  actualizarTarea(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data, this.getHeaders());
  }

  eliminarTarea(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.getHeaders());
  }
}
