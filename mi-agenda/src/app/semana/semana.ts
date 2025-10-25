import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-semana',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './semana.html',
  styleUrls: ['./semana.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SemanaComponent {
    // Lógica para cargar los eventos de la semana si es necesario
    eventos: any[] = [
     
    ];
}
