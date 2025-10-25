import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
  animations: [
    trigger('registerFadeIn', [
      state('void', style({ opacity: 0, transform: 'translateY(20px)' })),
      transition(':enter', [
        animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class RegisterComponent {
  // Add these properties to your component class
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  register() {
    // Your registration logic will go here
    console.log('Registering with:', this.name, this.email);
  }
}
