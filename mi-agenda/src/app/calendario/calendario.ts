import { Component, signal, computed, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SemanaComponent } from '../semana/semana'; // Importamos el sidebar derecho

// Definimos la interfaz para la vista y el día
type ViewMode = 'month' | 'week';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
}

@Component({
  selector: 'app-calendario',
  standalone: true,
  // Importamos el CommonModule (para @if, @for, DatePipe) y nuestro SemanaComponent
  imports: [CommonModule, DatePipe, SemanaComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: '../calendario/calendario.html', // Usamos el HTML que enviaste
  styleUrls: ['../calendario/calendario.css'] // Usamos un archivo CSS separado
})
export class CalendarioComponent implements OnInit {
  
  // SOLUCIÓN AL ERROR: viewMode() ahora existe
  viewMode = signal<ViewMode>('month');

  // SOLUCIÓN AL ERROR: current() (la fecha central del calendario) ahora existe
  current = signal<Date>(new Date());
  
  // Otros signals que mencionaste en tu código
  // modalOpen = signal(false);
  // editing = signal(false);
  // private editingId: string | null = null;
  
  readonly dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // --- MÉTODOS DE LA PLANTILLA ---

  setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
  }

  navigate(amount: number): void {
    this.current.update(currentDate => {
      const newDate = new Date(currentDate.getTime());
      
      // Navegar por mes o semana dependiendo del modo de vista
      if (this.viewMode() === 'month') {
        newDate.setMonth(newDate.getMonth() + amount);
      } else {
        // En modo semana, navegamos 7 días
        newDate.setDate(newDate.getDate() + (amount * 7));
      }
      return newDate;
    });
  }

  setToday(): void {
    this.current.set(new Date());
  }

  // --- SIGNAL COMPUTADA: monthGrid() (SOLUCIÓN AL ERROR) ---
  // Calcula la cuadrícula de días para la vista de Mes
  monthGrid = computed<CalendarDay[]>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    const currentDate = this.current();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // 1. Encontrar el primer día del mes
    const firstDayOfMonth = new Date(year, month, 1);
    // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado. La cuadrícula empieza en Domingo.
    let startDayOfWeek = firstDayOfMonth.getDay(); 

    // 2. Determinar la fecha de inicio de la cuadrícula (el primer domingo o día de la semana)
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(firstDayOfMonth.getDate() - startDayOfWeek);

    const days: CalendarDay[] = [];
    const numDaysToShow = 42; // 6 semanas * 7 días (para asegurar que quepa cualquier mes)

    for (let i = 0; i < numDaysToShow; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.getTime() === today.getTime();

      days.push({ 
        date, 
        isCurrentMonth, 
        isToday 
      });
    }

    return days;
  });

  // Método de ciclo de vida para inicializaciones (si es necesario)
  ngOnInit(): void {
    // Si quieres empezar en un mes específico, puedes modificar 'current' aquí
  }
}
