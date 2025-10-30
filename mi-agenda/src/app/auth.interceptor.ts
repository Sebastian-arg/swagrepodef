// src/app/auth.interceptor.ts

import { HttpInterceptorFn } from '@angular/common/http';
// 👈 Importa las funciones y tokens necesarios para SSR
import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common'; 

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    // 1. Inyecta el token PLATFORM_ID
    const platformId = inject(PLATFORM_ID);
    
    // 2. Declara authToken fuera del bloque condicional
    let authToken: string | null = null;

    // 3. 🛡️ PROTECCIÓN SSR: Solo accede a localStorage si es el navegador
    if (isPlatformBrowser(platformId)) {
        authToken = localStorage.getItem('user_token'); 
    }
    
    // El resto de la lógica permanece igual
    if (authToken) {
        const cloned = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${authToken}`)
        });
        return next(cloned);
    }
    return next(req);
};