import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class TareasService {

  private apiUrl = 'http://localhost:8000/api/tareas';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    let token = '';
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('user_token') || '';
    }
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  getTareas(): Observable<any> {
    return this.http.get(this.apiUrl, { headers: this.getHeaders() });
  }

  crearTarea(data: { titulo: string; fecha_limite: string; descripcion?: string }): Observable<any> {
    return this.http.post(this.apiUrl, data, { headers: this.getHeaders() });
  }

  actualizarTarea(id: number, data: { titulo: string; fecha_limite: string; descripcion?: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data, { headers: this.getHeaders() });
  }

  eliminarTarea(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
