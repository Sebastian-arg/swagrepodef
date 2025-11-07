import { Component, OnDestroy, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

// ✅ Definimos los tipos para los modos del temporizador
type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

@Component({
  selector: 'app-pomodoro',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pomodoro.html',
  styleUrls: ['./pomodoro.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PomodoroComponent implements OnDestroy {

  // ====================================
  // ✅ ESTADO CON SEÑALES
  // ====================================
  
  // Duraciones de los temporizadores en segundos
  private readonly POMODORO_DURATION = 25 * 60;
  private readonly SHORT_BREAK_DURATION = 5 * 60;
  private readonly LONG_BREAK_DURATION = 15 * 60;

  // Señal para el modo actual ('pomodoro', 'shortBreak', 'longBreak')
  mode = signal<TimerMode>('pomodoro');

  // Señal para el tiempo restante en el temporizador
  timer = signal(this.POMODORO_DURATION);

  // Señal para saber si el temporizador está corriendo
  isTimerRunning = signal(false);

  // Señal para contar los pomodoros completados
  pomodoroCount = signal(0);

  // Señal para la frase motivacional
  motivationalPhrase = signal('');
  
  private intervalId: any;
  private audio: HTMLAudioElement;

  private readonly motivationalPhrases: string[] = [
    'Tu yo del futuro te agradece',
    'Un poco todos los días > mucho alguna vez',
    'El éxito es la suma de pequeños esfuerzos',
    'La disciplina es el puente entre metas y logros.',
    'No cuentes los días, haz que los días cuenten.',
    'El futuro pertenece a quienes creen en la belleza de sus sueños.',
    'La mejor forma de predecir el futuro es crearlo.'
  ];

  // ====================================
  // ✅ CICLO DE VIDA Y CONSTRUCTOR
  // ====================================

  constructor() {
    this.audio = new Audio('assets/notification.mp3');
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  // ====================================
  // ✅ LÓGICA DEL TEMPORIZADOR
  // ====================================

  /** Inicia o reanuda el temporizador. */
  toggleTimer(): void {
    if (this.isTimerRunning()) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  private startTimer(): void {
    this.isTimerRunning.set(true);
    if (this.mode() === 'pomodoro') {
      this.selectRandomMotivationalPhrase();
    }

    this.intervalId = setInterval(() => {
      this.timer.update(current => {
        if (current <= 1) {
          this.handleTimerEnd();
          return 0; // Detener en 0 y esperar al cambio de modo
        }
        return current - 1;
      });
    }, 1000);
  }

  private pauseTimer(): void {
    this.isTimerRunning.set(false);
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  /** Se ejecuta cuando el temporizador llega a cero. */
  private handleTimerEnd(): void {
    this.playNotification();
    this.pauseTimer();

    if (this.mode() === 'pomodoro') {
      this.pomodoroCount.update(count => count + 1);
      // Si completamos 4 pomodoros, tomamos un descanso largo. Si no, uno corto.
      const nextMode = this.pomodoroCount() % 4 === 0 ? 'longBreak' : 'shortBreak';
      this.setMode(nextMode);
    } else {
      // Si termina un descanso, volvemos al modo pomodoro
      this.setMode('pomodoro');
    }
  }

  // ====================================
  // ✅ CAMBIO DE MODO
  // ====================================

  /** Cambia el modo y resetea el temporizador. */
  setMode(newMode: TimerMode): void {
    this.mode.set(newMode);
    this.pauseTimer(); // Pausar al cambiar de modo

    switch (newMode) {
      case 'pomodoro':
        this.timer.set(this.POMODORO_DURATION);
        break;
      case 'shortBreak':
        this.timer.set(this.SHORT_BREAK_DURATION);
        break;
      case 'longBreak':
        this.timer.set(this.LONG_BREAK_DURATION);
        break;
    }
  }

  // ====================================
  // ✅ UTILIDADES
  // ====================================

  /** Formatea los segundos a un string MM:SS. */
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${this.padZero(minutes)}:${this.padZero(remainingSeconds)}`;
  }

  private padZero(num: number): string {
    return num < 10 ? `0${num}` : num.toString();
  }

  private selectRandomMotivationalPhrase(): void {
    const randomIndex = Math.floor(Math.random() * this.motivationalPhrases.length);
    this.motivationalPhrase.set(this.motivationalPhrases[randomIndex]);
  }

  private playNotification(): void {
    this.audio.play().catch(err => console.error("Error al reproducir audio:", err));
  }
}
