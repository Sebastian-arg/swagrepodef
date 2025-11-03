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
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import localeEsAr from '@angular/common/locales/es-AR';
import { EventosService } from '../services/eventos.service';
import { TareasService } from '../services/tareas.service';


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

interface CalendarTarea {
  id: number;
  titulo: string;
  fecha_limite: string;
  descripcion?: string;
  etiqueta?: string;
}

// =========================================================================
// FUNCIÓN DE UTILIDAD: Obtener el inicio de la semana (Lunes)
// =========================================================================
function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  let day = d.getDay(); // 0 (Dom) a 6 (Sáb)
  
  // Mapea Domingo (0) a 6 y otros días (1-6) a (día - 1) para obtener el desfase hasta el Lunes.
  // Ejemplo: Lunes (1) -> 0 desfase. Jueves (4) -> 3 desfase. Domingo (0) -> 6 desfase.
  day = day === 0 ? 6 : day - 1; 
  
  const diff = d.getDate() - day; // Ajusta la fecha al Lunes
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
// =========================================================================

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterOutlet, RouterLink, RouterLinkActive],
  providers: [
    DatePipe,
    { provide: LOCALE_ID, useValue: 'es-AR' }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './calendario.html',
  styleUrls: ['./calendario.css']
})
export class CalendarioComponent implements OnInit {

  viewMode = signal<ViewMode>('month');
  current = signal<Date>(new Date());
  modalSeleccionOpen = signal(false);
  selectedDate = signal<Date | null>(null);

  // ✅ Modificado: Empieza en Lunes, termina en Domingo y sin acento en Miercoles
  readonly dayNames = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sáb', 'Dom'];

  eventos = signal<CalendarEvent[]>([]);
  modalEventosOpen = signal(false);
  agregandoEvento = signal(false);
  editandoEvento = signal<number | null>(null);

  eventoTitulo = '';
  eventoFecha = '';
  eventoDescripcion = '';

  tareas = signal<CalendarTarea[]>([]);
  modalTareasOpen = signal(false);
  agregandoTarea = signal(false);
  editandoTarea = signal<number | null>(null);

  tareaTitulo = '';
  tareaFecha = '';
  tareaDescripcion = '';

  // =========================================================================
  // Lógica para la vista semanal (inicia en Lunes)
  // =========================================================================
  weekDays = computed<CalendarDay[]>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Usa la función ajustada para obtener el Lunes
    const startDate = getStartOfWeek(this.current());

    const days: CalendarDay[] = [];
    const currentMonth = this.current().getMonth();

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      days.push({
        date,
        isCurrentMonth: date.getMonth() === currentMonth,
        isToday: date.getTime() === today.getTime()
      });
    }

    return days;
  });

  // =========================================================================
  // Lógica para la vista mensual (inicia en Lunes)
  // =========================================================================
  monthGrid = computed<CalendarDay[]>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentDate = this.current();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    
    // ✅ Ajuste para que la cuadrícula inicie en Lunes
    let startDayOfWeek = firstDay.getDay(); // 0=Dom, 1=Lun, ..., 6=Sáb
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // 0 desfase para Lun, 6 desfase para Dom

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
    public router: Router,
    private http: HttpClient,
    private eventosService: EventosService,
    private tareasService: TareasService
  ) {}

  ngOnInit(): void {
    this.cargarEventos();
    this.cargarTareas();
  }
  
  // =========================================================================
  // MÉTODOS DE NAVEGACIÓN Y VISTA
  // =========================================================================
  setViewMode(mode: ViewMode) {
    this.viewMode.set(mode);
  }

  navigate(direction: -1 | 1) {
    const newDate = new Date(this.current());
    
    if (this.viewMode() === 'month') {
      newDate.setMonth(newDate.getMonth() + direction);
    } else { // 'week'
      // Navega 7 días
      newDate.setDate(newDate.getDate() + (direction * 7));
    }
    this.current.set(newDate);
  }

  setToday() {
    this.current.set(new Date());
  }

  // =========================================================================
  // MÉTODOS DE CONTADOR
  // =========================================================================
  isSameDay(d1: Date, d2: Date): boolean {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

  countEvents(date: Date): number {
    return this.eventos().filter(e => {
      const eventDate = new Date(e.fecha_inicio + 'T00:00:00');
      return this.isSameDay(eventDate, date);
    }).length;
  }

  countTareas(date: Date): number {
    return this.tareas().filter(t => {
      const tareaDate = new Date(t.fecha_limite + 'T00:00:00');
      return this.isSameDay(tareaDate, date);
    }).length;
  }
  // =========================================================================

  // MÉTODOS DE CRUD y MODALES
  cargarEventos() {
    this.eventosService.getAll().subscribe({
      next: (data) => this.eventos.set(data),
      error: (err) => console.error('ERROR cargando eventos:', err)
    });
  }

  cargarTareas() {
    this.tareasService.getTareas().subscribe({
      next: (data) => this.tareas.set(data as CalendarTarea[]),
      error: (err) => console.error('ERROR cargando tareas:', err)
    });
  }

  openEventosModalList() {
    this.modalEventosOpen.set(true);
    this.modalTareasOpen.set(false);
    this.modalSeleccionOpen.set(false);
    this.cancelarFormularioEvento(false);
    this.selectedDate.set(null);
  }

  closeEventosModal() {
    this.modalEventosOpen.set(false);
    this.cancelarFormularioEvento(false);
  }

  startAgregarEvento(dateToPreload?: Date | null) {
    this.agregandoEvento.set(true);
    this.editandoEvento.set(null);
    this.eventoTitulo = '';
    const date = dateToPreload || new Date();
    this.eventoFecha = this.datePipe.transform(date, 'yyyy-MM-dd') || '';
    this.eventoDescripcion = '';
  }

  startEditarEvento(id: number) {
    const evt = this.eventos().find(e => e.id === id);
    if (!evt) return;

    this.agregandoEvento.set(false);
    this.editandoEvento.set(id);

    this.eventoTitulo = evt.titulo;
    this.eventoFecha = evt.fecha_inicio;
    this.eventoDescripcion = evt.descripcion || '';
  }

  cancelarFormularioEvento(close = true) {
    this.agregandoEvento.set(false);
    this.editandoEvento.set(null);
    this.eventoTitulo = '';
    this.eventoFecha = '';
    this.eventoDescripcion = '';

    if (close) this.modalEventosOpen.set(false);
  }

  guardarEvento() {
    const data = {
      titulo: this.eventoTitulo.trim(),
      fecha_inicio: this.eventoFecha,
      descripcion: this.eventoDescripcion
    };

    if (!data.titulo || !data.fecha_inicio) {
      console.warn('Completar título y fecha');
      return;
    }

    if (this.editandoEvento() !== null) {
      const id = this.editandoEvento()!;
      this.eventosService.update(id, data).subscribe({
        next: (actualizado) => {
          this.eventos.update(prev =>
            prev.map(e => e.id === id ? actualizado : e)
          );
          this.cancelarFormularioEvento();
        }
      });
      return;
    }

    this.eventosService.create(data).subscribe({
      next: (nuevo) => {
        this.eventos.update(prev => [...prev, nuevo]);
        this.cancelarFormularioEvento();
      }
    });
  }

  eliminarEvento(id: number) {
    if (!window.confirm('¿Eliminar este evento?')) return;

    this.eventosService.delete(id).subscribe({
      next: () => this.eventos.update(prev => prev.filter(e => e.id !== id))
    });

    if (this.editandoEvento() === id) this.cancelarFormularioEvento();
  }

  openTareasModalList() {
    this.modalTareasOpen.set(true);
    this.modalEventosOpen.set(false);
    this.modalSeleccionOpen.set(false);
    this.cancelarFormularioTarea(false);
    this.selectedDate.set(null);
  }

  closeTareasModal() {
    this.modalTareasOpen.set(false);
  }

  startAgregarTarea(dateToPreload?: Date | null) {
    this.agregandoTarea.set(true);
    this.editandoTarea.set(null);
    this.tareaTitulo = '';
    const date = dateToPreload || new Date();
    this.tareaFecha = this.datePipe.transform(date, 'yyyy-MM-dd') || '';
    this.tareaDescripcion = '';
  }

  startEditarTarea(id: number) {
    const t = this.tareas().find(e => e.id === id);
    if (!t) return;

    this.agregandoTarea.set(false);
    this.editandoTarea.set(id);

    this.tareaTitulo = t.titulo;
    this.tareaFecha = t.fecha_limite;
    this.tareaDescripcion = t.descripcion || '';
  }

  cancelarFormularioTarea(close = true) {
    this.agregandoTarea.set(false);
    this.editandoTarea.set(null);
    this.tareaTitulo = '';
    this.tareaFecha = '';
    this.tareaDescripcion = '';

    if (close) this.modalTareasOpen.set(false);
  }

  guardarTarea() {
    const data = {
      titulo: this.tareaTitulo.trim(),
      fecha_limite: this.tareaFecha,
      descripcion: this.tareaDescripcion
    };

    if (!data.titulo || !data.fecha_limite) {
      console.warn('Completar título y fecha');
      return;
    }

    if (this.editandoTarea() !== null) {
      const id = this.editandoTarea()!;
      this.tareasService.actualizarTarea(id, data).subscribe({
        next: () => {
          this.cargarTareas();
          this.cancelarFormularioTarea();
        },
        error: (err) => console.error('Error editando tarea', err)
      });
      return;
    }

    this.tareasService.crearTarea(data).subscribe({
      next: () => {
        this.cargarTareas();
        this.cancelarFormularioTarea();
      },
      error: (err) => console.error('Error creando tarea', err)
    });
  }

  eliminarTarea(id: number) {
    if (!window.confirm('¿Eliminar esta tarea?')) return;

    this.tareasService.eliminarTarea(id).subscribe({
      next: () => {
        this.cargarTareas();
        if (this.editandoTarea() === id) this.cancelarFormularioTarea();
      },
      error: (err) => console.error('Error eliminando tarea', err)
    });
  }

  openSelectionModal(date: Date) {
    this.selectedDate.set(date);
    this.modalSeleccionOpen.set(true);
    this.modalEventosOpen.set(false);
    this.modalTareasOpen.set(false);
  }

  closeSelectionModal() {
    this.modalSeleccionOpen.set(false);
    this.selectedDate.set(null);
  }

  addNewEvent() {
    this.closeSelectionModal();
    this.modalEventosOpen.set(true);
    this.startAgregarEvento(this.selectedDate());
  }

  addNewTask() {
    this.closeSelectionModal();
    this.modalTareasOpen.set(true);
    this.startAgregarTarea(this.selectedDate());
  }

  logout() {
    // Lógica de logout simulada (a completar según tu autenticación)
    console.log("Cerrando sesión...");
    this.router.navigate(['/login']); 
  }
}