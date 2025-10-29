import { Component, signal, computed, ChangeDetectionStrategy, OnInit, LOCALE_ID } from '@angular/core';
import { CommonModule, DatePipe, registerLocaleData } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import localeEsAr from '@angular/common/locales/es-AR'; // Importamos el locale para español
import { SemanaComponent } from '../semana/semana';

// 1. REGISTRAMOS EL LOCALE ESPAÑOL (Necesario para que el DatePipe funcione en español)
registerLocaleData(localeEsAr, 'es-AR'); 

type ViewMode = 'month' | 'week';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
}

interface CalendarEvent {
  id: number;
  titulo: string;
  fecha: string; // ISO date string 'YYYY-MM-DD'
  descripcion?: string;
}

@Component({
  selector: 'app-calendario',
  standalone: true,
  // Asegúrate de que HttpClientModule esté en imports para usar el HttpClient
  imports: [CommonModule, DatePipe, SemanaComponent, FormsModule, HttpClientModule], 
  providers: [
    DatePipe,
    // 2. PROVEEMOS EL LOCALE ESPAÑOL A TODA LA VISTA
    { provide: LOCALE_ID, useValue: 'es-AR' } // Establece el idioma para pipes
  ],  
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './calendario.html',
  styleUrls: ['./calendario.css']
})
export class CalendarioComponent implements OnInit {

  viewMode = signal<ViewMode>('month');
  current = signal<Date>(new Date());
  // Días de la semana en español, para la cabecera del calendario
  readonly dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];


  monthGrid = computed<CalendarDay[]>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentDate = this.current();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    let startDayOfWeek = firstDayOfMonth.getDay();

    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(firstDayOfMonth.getDate() - startDayOfWeek);

    const days: CalendarDay[] = [];
    const numDaysToShow = 42; 

    for (let i = 0; i < numDaysToShow; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.getTime() === today.getTime();
      days.push({ date, isCurrentMonth, isToday });
    }
    return days;
  });

  setViewMode(mode: ViewMode): void { this.viewMode.set(mode); }
  navigate(amount: number): void {
    this.current.update(currentDate => {
      const newDate = new Date(currentDate.getTime());
      if (this.viewMode() === 'month') newDate.setMonth(newDate.getMonth() + amount);
      else newDate.setDate(newDate.getDate() + (amount * 7)); 
      return newDate;
    });
  }
  setToday(): void { this.current.set(new Date()); }

  modalEventosOpen = signal(false);
  eventos = signal<CalendarEvent[]>([]);
  agregando = signal(false);
  editando = signal<number | null>(null);

  eventoTitulo = '';
  eventoFecha = ''; 
  eventoDescripcion = '';
  private nextId = 1;

  constructor(
    private datePipe: DatePipe, 
    private router: Router, 
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const currentMonth = this.current().getMonth() + 1; // 1-12
    const currentYear = this.current().getFullYear();
    this.eventos.set([
      { 
        id: this.nextId++, 
        titulo: 'Reunión de proyecto', 
        fecha: `${currentYear}-${String(currentMonth).padStart(2, '0')}-05`, 
        descripcion: 'Preparar presentación final.' 
      }
    ]);
  }

  openEventosModal(event?: Event) {
    if (event) event.preventDefault();
    this.modalEventosOpen.set(true);
    this.cancelForm(false);
  }

  closeEventosModal() {
    this.modalEventosOpen.set(false);
    this.cancelForm(false);
  }

  startAgregar() {
    this.agregando.set(true);
    this.editando.set(null);
    this.eventoTitulo = '';
    this.eventoFecha = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';
    this.eventoDescripcion = '';
  }

  startEditar(id: number) {
    const found = this.eventos().find(e => e.id === id);
    if (!found) return;
    this.editando.set(id);
    this.agregando.set(false);
    this.eventoTitulo = found.titulo;
    this.eventoFecha = found.fecha;
    this.eventoDescripcion = found.descripcion || '';
  }

  cancelForm(closeForm = true) {
    this.agregando.set(false);
    this.editando.set(null);
    this.eventoTitulo = '';
    this.eventoFecha = '';
    this.eventoDescripcion = '';
  }

  guardarEvento() {
    const titulo = this.eventoTitulo?.trim();
    const fecha = this.eventoFecha; 
    if (!titulo || !fecha) {
      console.error('ERROR: Completá al menos Título y Fecha.');
      return;
    }

    if (this.editando() !== null) {
      const id = this.editando() as number;
      const updated = this.eventos().map(e => {
        if (e.id === id) {
          return { ...e, titulo, fecha, descripcion: this.eventoDescripcion };
        }
        return e;
      });
      this.eventos.set(updated);
      this.cancelForm();
      return;
    }

    const nuevo: CalendarEvent = {
      id: this.nextId++,
      titulo,
      fecha,
      descripcion: this.eventoDescripcion
    };
    this.eventos.update(prev => [...prev, nuevo]);
    this.cancelForm();
  }

  eliminarEvento(id: number) {
    console.warn(`Simulando confirmación: Eliminando evento con ID ${id}`);
    this.eventos.update(prev => prev.filter(e => e.id !== id));
    if (this.editando() === id) this.cancelForm();
  }

  hasEvents(date: Date): boolean {
    const dateStr = this.datePipe.transform(date, 'yyyy-MM-dd');
    return this.eventos().some(e => e.fecha === dateStr);
  }

  logout() {
  const apiUrl = 'http://localhost:8000/api/logout';
  const token = localStorage.getItem('user_token');

  this.http.post(apiUrl, {}, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).subscribe({
    next: () => {
      console.log('Sesión cerrada en el servidor.');
    },
    error: (error) => {
      console.warn('Error al cerrar sesión en Laravel. Limpiando sesión local...', error);
    },
    complete: () => {
      localStorage.removeItem('user_token');
      localStorage.removeItem('user_details');
      this.router.navigate(['/login']);
    }
  });
 }

}
