import { Routes } from '@angular/router';
import { Cuerpo } from './cuerpo/cuerpo';
import { LoginComponent } from './login/login';
import { RegisterComponent } from './register/register';
import { CalendarioComponent } from './calendario/calendario';
import { PomodoroComponent } from './pomodoro/pomodoro';

export const routes: Routes = [
    {path: '', component: Cuerpo},
    {path: 'login', component: LoginComponent},
    {path: 'register', component: RegisterComponent},
    {path: 'calendario', component: CalendarioComponent},
    {path: 'pomodoro', component: PomodoroComponent}
];
