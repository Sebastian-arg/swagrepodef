// src/app/services/eventos.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Evento {
  id: number;
  titulo: string;
  fecha_inicio: string;
  fecha_fin?: string;
  descripcion?: string;
  etiqueta?: string;
}

@Injectable({ providedIn: 'root' })
export class EventosService {
  private apiUrl = 'http://localhost:8000/api/eventos';
  private token = localStorage.getItem('user_token');

  constructor(private http: HttpClient) {}

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.token}`
    };
  }

  obtenerEventos(): Observable<Evento[]> {
    return this.http.get<Evento[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  crearEvento(evento: Partial<Evento>): Observable<Evento> {
    return this.http.post<Evento>(this.apiUrl, evento, { headers: this.getHeaders() });
  }

  actualizarEvento(id: number, evento: Partial<Evento>): Observable<Evento> {
    return this.http.put<Evento>(`${this.apiUrl}/${id}`, evento, { headers: this.getHeaders() });
  }

  eliminarEvento(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
