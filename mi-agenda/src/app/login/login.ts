import { Component } from '@angular/core';
import { Router } from '@angular/router'; 
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http'; 
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  standalone: true,
  imports: [ FormsModule],
  
  animations: [
    trigger('loginFadeIn', [
      state('void', style({ opacity: 0, transform: 'translateY(20px)' })),
      transition(':enter', [
        animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})

export class LoginComponent { 

  email: string = '';
  password: string = '';

   constructor(private http: HttpClient, private router: Router) {} 

  login() {
    console.log('Email:', this.email);
    console.log('Password:', this.password);

    this.http.post('http://localhost:8000/api/login', { 
      email: this.email, 
      password: this.password 
    }).subscribe({
      next: (res: any) => {
        if (res.success) {
          // No se usa alert() para evitar problemas en el navegador, usa un cuadro de mensaje
          // o loguea la respuesta.
          console.log('Bienvenido');
          this.router.navigate(['/calendario']);
        } else {
          console.log(res.message);
        }
      },
      error: (err) => {
        console.error('Error al conectar con el backend', err);
        console.log('No se pudo conectar con el servidor');
      }
    });
  }
}
