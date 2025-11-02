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
import { Router, RouterOutlet } from '@angular/router';
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
  fecha_inicio: string; // Eventos usan fecha_inicio
  fecha_fin?: string;
  descripcion?: string;
  etiqueta?: string;
}

// ⚠️ Definir una interfaz para tareas que refleje la propiedad fecha_limite
interface CalendarTarea {
  id: number;
  titulo: string;
  fecha_limite: string; // Tareas usan fecha_limite
  descripcion?: string;
  etiqueta?: string;
}

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterOutlet],
  providers: [
    DatePipe,
    { provide: LOCALE_ID, useValue: 'es-AR' }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './calendario.html',
  styleUrls: ['./calendario.css']
})
export class CalendarioComponent implements OnInit {

  /* ===============================
  * 🗓️ ESTADO GENERAL
  * =============================== */
  viewMode = signal<ViewMode>('month');
  current = signal<Date>(new Date());
  
  // 🆕 Estado para el modal de selección y la fecha seleccionada
  modalSeleccionOpen = signal(false);
  selectedDate = signal<Date | null>(null);

  readonly dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  /* ===============================
  * 📅 EVENTOS
  * =============================== */
  eventos = signal<CalendarEvent[]>([]);
  modalEventosOpen = signal(false);
  agregandoEvento = signal(false);
  editandoEvento = signal<number | null>(null);

  eventoTitulo = '';
  eventoFecha = '';
  eventoDescripcion = '';

  /* ===============================
  * ✅ TAREAS
  * =============================== */
  // ⚠️ Actualizar el tipo de señal a CalendarTarea[]
  tareas = signal<CalendarTarea[]>([]); 
  modalTareasOpen = signal(false);
  agregandoTarea = signal(false);
  editandoTarea = signal<number | null>(null);

  tareaTitulo = '';
  tareaFecha = '';
  tareaDescripcion = '';

  /* ===============================
  * 📅 CALENDARIO
  * =============================== */
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

  /* ===============================
  * ⚙️ CONSTRUCTOR
  * =============================== */
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

  /* ===============================
  * 🎯 EVENTOS CRUD
  * =============================== */

  cargarEventos() {
    this.eventosService.getAll().subscribe({
      next: (data) => this.eventos.set(data),
      error: (err) => console.error('ERROR cargando eventos:', err)
    });
  }

  cargarTareas() {
  this.tareasService.getTareas().subscribe({
    // ⚠️ Asegúrate de que tu servicio retorna CalendarTarea[] si tienes un campo fecha_limite
    next: (data) => this.tareas.set(data as CalendarTarea[]), 
    error: (err) => console.error('ERROR cargando tareas:', err)
  });
}

  // 🔄 Renombrada: Se usa en el menú lateral. Abre el modal de la LISTA de eventos.
  openEventosModalList() {
    this.modalEventosOpen.set(true);
    this.modalTareasOpen.set(false);
    this.modalSeleccionOpen.set(false);
    this.cancelarFormularioEvento(false); // Asegura que el formulario de agregar esté oculto
    this.selectedDate.set(null);
  }

  closeEventosModal() {
    this.modalEventosOpen.set(false);
    this.cancelarFormularioEvento(false);
  }

  // 🔄 Modificada: Permite pasar una fecha para precargar o usa la actual por defecto
  startAgregarEvento(dateToPreload?: Date | null) {
    this.agregandoEvento.set(true);
    this.editandoEvento.set(null);
    this.eventoTitulo = '';
    
    // Usar la fecha pasada o la fecha actual
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
      // ⚠️ Reemplazar alert() por un mensaje o modal personalizado
      // Usaremos console.warn aquí. En un proyecto real se usaría un modal.
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
    // ⚠️ Reemplazar confirm() por un mensaje o modal personalizado
    if (!window.confirm('¿Eliminar este evento?')) return; 

    this.eventosService.delete(id).subscribe({
      next: () => this.eventos.update(prev => prev.filter(e => e.id !== id))
    });

    if (this.editandoEvento() === id) this.cancelarFormularioEvento();
  }

  /* ===============================
  * 📝 TAREAS CRUD
  * =============================== */

  // 🔄 Renombrada: Se usa en el menú lateral. Abre el modal de la LISTA de tareas.
  openTareasModalList() {
    this.modalTareasOpen.set(true);
    this.modalEventosOpen.set(false);
    this.modalSeleccionOpen.set(false);
    this.cancelarFormularioTarea(false); // Asegura que el formulario de agregar esté oculto
    this.selectedDate.set(null);
  }

  closeTareasModal() {
    this.modalTareasOpen.set(false);
  }

  // 🔄 Modificada: Permite pasar una fecha para precargar o usa la actual por defecto
  startAgregarTarea(dateToPreload?: Date | null) {
    this.agregandoTarea.set(true);
    this.editandoTarea.set(null);

    this.tareaTitulo = '';
    
    // Usar la fecha pasada o la fecha actual
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
      // ⚠️ Reemplazar alert() por un mensaje o modal personalizado
      console.warn('Completar título y fecha'); 
      return;
    }

    // ✅ EDITAR
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

    // ✅ CREAR
    this.tareasService.crearTarea(data).subscribe({
      next: () => {
        this.cargarTareas();
        this.cancelarFormularioTarea();
      },
      error: (err) => console.error('Error creando tarea', err)
    });
  }

  eliminarTarea(id: number) {
    // ⚠️ Reemplazar confirm() por un mensaje o modal personalizado
    if (!window.confirm('¿Eliminar esta tarea?')) return; 

    this.tareasService.eliminarTarea(id).subscribe({
      next: () => {
        this.cargarTareas();
        if (this.editandoTarea() === id) this.cancelarFormularioTarea();
      },
      error: (err) => console.error('Error eliminando tarea', err)
    });
  }

  /* ===============================
  * 🆕 NUEVA LÓGICA DE MODAL DE SELECCIÓN
  * =============================== */

  /**
   * Abre el modal de selección y guarda la fecha del día clickeado.
   * Usado en el calendario al hacer click en un día.
   */
  openSelectionModal(date: Date) {
    this.selectedDate.set(date);
    this.modalSeleccionOpen.set(true);
    // Aseguramos que los otros modales estén cerrados
    this.modalEventosOpen.set(false);
    this.modalTareasOpen.set(false);
  }

  closeSelectionModal() {
    this.modalSeleccionOpen.set(false);
    this.selectedDate.set(null);
  }
  
  /**
   * Navega para agregar un nuevo evento, precargando la fecha seleccionada.
   * Usado desde el modal de selección.
   */
  addNewEvent() {
    const dateToUse = this.selectedDate();
    
    // 1. Cerrar el modal de selección
    this.modalSeleccionOpen.set(false); 
    
    // 2. Abrir el modal de Eventos
    this.modalEventosOpen.set(true);
    this.modalTareasOpen.set(false); 

    // 3. Iniciar el formulario de agregar con la fecha precargada
    if (dateToUse) {
        this.startAgregarEvento(dateToUse);
    } else {
        this.startAgregarEvento(); 
    }
    this.selectedDate.set(null); // Limpiar estado después de usar
  }

  /**
   * Navega para agregar una nueva tarea, precargando la fecha seleccionada.
   * Usado desde el modal de selección.
   */
  addNewTask() {
    const dateToUse = this.selectedDate();
    
    // 1. Cerrar el modal de selección
    this.modalSeleccionOpen.set(false); 

    // 2. Abrir el modal de Tareas
    this.modalTareasOpen.set(true);
    this.modalEventosOpen.set(false); 

    // 3. Iniciar el formulario de agregar con la fecha precargada
    if (dateToUse) {
        this.startAgregarTarea(dateToUse);
    } else {
        this.startAgregarTarea(); 
    }
    this.selectedDate.set(null); // Limpiar estado después de usar
  }


  /* ===============================
  * 📆 UTILIDADES DEL CALENDARIO
  * =============================== */
  
  /** 🆕 Cuenta el número de tareas para un día. */
  countTareas(date: Date): number {
    const dayKey = this.datePipe.transform(date, 'yyyy-MM-dd');

    return this.tareas().filter(t => {
      const tareaDateKey = this.datePipe.transform(t.fecha_limite, 'yyyy-MM-dd');
      return tareaDateKey === dayKey;
    }).length;
  }

  /** 🆕 Cuenta el número de eventos para un día. */
  countEvents(date: Date): number {
    const dayKey = this.datePipe.transform(date, 'yyyy-MM-dd');
    
    return this.eventos().filter(e => {
        const eventDateKey = this.datePipe.transform(e.fecha_inicio, 'yyyy-MM-dd');
        return eventDateKey === dayKey;
    }).length;
  }
  

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

  /* ===============================
  * 🚪 LOGOUT
  * =============================== */
  logout() {
    const token = localStorage.getItem('user_token');

    this.http.post(
      'http://localhost:8000/api/logout',
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe({
      complete: () => {
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_details');
        this.router.navigate(['/login']);
      }
    });
  }
}
