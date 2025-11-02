import { Component, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-pomodoro',
  templateUrl: './pomodoro.html',
  styleUrls: ['./pomodoro.css']
})
export class PomodoroComponent implements OnDestroy {
  timer: number = 25 * 60; // 25 minutes in seconds
  isTimerRunning: boolean = false;
  private intervalId: any;
  motivationalPhrase: string = '';
  private audio: HTMLAudioElement;

  private motivationalPhrases: string[] = [
    'Tu yo del futuro te agradece',
    'Un poco todos los días > mucho alguna vez',
    'El éxito es la suma de pequeños esfuerzos'
  ];

  constructor() {
    this.audio = new Audio('/assets/notification.mp3'); // Asegúrate de tener este archivo de audio en tu carpeta de assets
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  startTimer(): void {
    if (!this.isTimerRunning) {
      this.isTimerRunning = true;
      this.selectRandomMotivationalPhrase();
      this.intervalId = setInterval(() => {
        this.timer--;
        if (this.timer < 0) {
          this.playNotification();
          this.resetTimer();
        }
      }, 1000);
    }
  }

  pauseTimer(): void {
    if (this.isTimerRunning) {
      this.isTimerRunning = false;
      clearInterval(this.intervalId);
    }
  }

  resetTimer(): void {
    this.pauseTimer();
    this.timer = 25 * 60;
  }

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
    this.motivationalPhrase = this.motivationalPhrases[randomIndex];
  }

  private playNotification(): void {
    this.audio.play();
  }
}
