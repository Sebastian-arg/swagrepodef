import {
  Component,
  signal,
  computed,
  ChangeDetectionStrategy,
  OnInit,
  LOCALE_ID
} from '@angular/core';

import {
  CommonModule,
  DatePipe,
  registerLocaleData
} from '@angular/common';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import localeEsAr from '@angular/common/locales/es-AR';
import { SemanaComponent } from '../semana/semana';
import { EventosService } from '../services/eventos.service';

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
  fecha_inicio: string;
  fecha_fin?: string;
  descripcion?: string;
  etiqueta?: string;
}

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, SemanaComponent],
  providers: [
    DatePipe,
    { provide: LOCALE_ID, useValue: 'es-AR' }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './calendario.html',
  styleUrls: ['./calendario.css']
})
export class CalendarioComponent implements OnInit {

  // Estado del calendario
  viewMode = signal<ViewMode>('month');
  current = signal<Date>(new Date());

  // Estado de eventos
  eventos = signal<CalendarEvent[]>([]);
  modalEventosOpen = signal(false);

  agregando = signal(false);
  editando = signal<number | null>(null);

  eventoTitulo = '';
  eventoFecha = '';
  eventoDescripcion = '';

  readonly dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  monthGrid = computed<CalendarDay[]>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentDate = this.current();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay();

    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - startDayOfWeek);

    const days: CalendarDay[] = [];
    const total = 42;

    for (let i = 0; i < total; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      days.push({
        date,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.getTime() === today.getTime()
      });
    }

    return days;
  });

  constructor(
    private datePipe: DatePipe,
    private router: Router,
    private http: HttpClient,
    private eventosService: EventosService
  ) {}

  ngOnInit(): void {
    this.cargarEventos();
  }

  /** ✅ Cargar eventos desde Laravel */
  cargarEventos() {
    this.eventosService.getAll().subscribe({
      next: (data) => this.eventos.set(data),
      error: (err) => console.error("ERROR cargando eventos:", err)
    });
  }

  /** ✅ Modal */
  openEventosModal() {
    this.modalEventosOpen.set(true);
    this.cancelForm(false);
  }

  closeEventosModal() {
    this.modalEventosOpen.set(false);
    this.cancelForm(false);
  }

  /** ✅ Nueva creación */
  startAgregar() {
    this.agregando.set(true);
    this.editando.set(null);

    this.eventoTitulo = '';
    this.eventoFecha = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';
    this.eventoDescripcion = '';
  }

  /** ✅ Edición */
  startEditar(id: number) {
    const evt = this.eventos().find(e => e.id === id);
    if (!evt) return;

    this.agregando.set(false);
    this.editando.set(id);

    this.eventoTitulo = evt.titulo;
    this.eventoFecha = evt.fecha_inicio;
    this.eventoDescripcion = evt.descripcion || '';
  }

  /** ✅ Limpiar formulario */
  cancelForm(close = true) {
    this.agregando.set(false);
    this.editando.set(null);
    this.eventoTitulo = '';
    this.eventoFecha = '';
    this.eventoDescripcion = '';

    if (close) this.modalEventosOpen.set(false);
  }

  /** ✅ Guardar (Crear o Editar) */
  guardarEvento() {
    const data = {
      titulo: this.eventoTitulo.trim(),
      fecha_inicio: this.eventoFecha,
      descripcion: this.eventoDescripcion
    };

    if (!data.titulo || !data.fecha_inicio) {
      alert("Completar título y fecha");
      return;
    }

    // ✅ Editar
    if (this.editando() !== null) {
      const id = this.editando()!;

      this.eventosService.update(id, data).subscribe({
        next: (actualizado) => {
          this.eventos.update(prev =>
            prev.map(e => e.id === id ? actualizado : e)
          );
          this.cancelForm();
        }
      });

      return;
    }

    // ✅ Crear nuevo
    this.eventosService.create(data).subscribe({
      next: (nuevo) => {
        this.eventos.update(prev => [...prev, nuevo]);
        this.cancelForm();
      }
    });
  }

  /** ✅ Borrar */
  eliminarEvento(id: number) {
    if (!confirm("¿Eliminar este evento?")) return;

    this.eventosService.delete(id).subscribe({
      next: () =>
        this.eventos.update(prev => prev.filter(e => e.id !== id))
    });

    if (this.editando() === id) this.cancelForm();
  }

  /** ✅ Ver si un día tiene eventos */
  hasEvents(date: Date): boolean {
    const d = this.datePipe.transform(date, 'yyyy-MM-dd');
    return this.eventos().some(e => e.fecha_inicio === d);
  }

  /** ✅ Navegación del calendario */
  navigate(amount: number): void {
    this.current.update(cur => {
      const newDate = new Date(cur.getTime());
      if (this.viewMode() === 'month')
        newDate.setMonth(newDate.getMonth() + amount);
      else
        newDate.setDate(newDate.getDate() + amount * 7);
      return newDate;
    });
  }

  setToday(): void {
    this.current.set(new Date());
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
  }

  /** ✅ Logout */
  logout() {
    const token = localStorage.getItem('user_token');

    this.http.post(
      'http://localhost:8000/api/logout',
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .subscribe({
      complete: () => {
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_details');
        this.router.navigate(['/login']);
      }
    });
  }
}
