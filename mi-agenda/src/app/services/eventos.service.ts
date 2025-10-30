import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Evento {
  id: number;
  titulo: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin?: string;
  etiqueta?: string;
}

@Injectable({ providedIn: 'root' })
export class EventosService {
  private apiUrl = 'http://localhost:8000/api/eventos';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Evento[]> {
    return this.http.get<Evento[]>(this.apiUrl);
  }

  create(data: Partial<Evento>): Observable<Evento> {
    return this.http.post<Evento>(this.apiUrl, data);
  }

  update(id: number, data: Partial<Evento>): Observable<Evento> {
    return this.http.put<Evento>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
