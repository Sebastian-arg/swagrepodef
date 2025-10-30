// src/app/app.config.ts

import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
// 👈 Importa 'withFetch'
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http'; 
import { provideAnimations } from '@angular/platform-browser/animations';

import { authInterceptor } from './auth.interceptor';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideZonelessChangeDetection(),
        provideRouter(routes),
        provideClientHydration(withEventReplay()),
        provideAnimations(),

        provideHttpClient(
            // 🚀 AÑADIDO: Habilita la API Fetch para SSR
            withFetch(), 
            withInterceptors([authInterceptor])
        )
    ]
};