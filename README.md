# Proyecto Base - Configuración Frontend y Backend  
# Instrucciones de Instalación y Ejecución

[![Mantenimiento](https://img.shields.io/badge/Maintained-yes-green.svg)](https://github.com/mary-s-rgb)
[![Tecnologías](https://img.shields.io/badge/Stack-Angular%20%7C%20Laravel-orange)](https://angular.io/)
[![Estado](https://img.shields.io/badge/Estado-Configuración%20Inicial-blue)](https://github.com/mary-s-rgb)

Este documento contiene las instrucciones necesarias para configurar y ejecutar correctamente el proyecto en un entorno local, abarcando tanto el **frontend (Angular)** como el **backend (Laravel)**.

---

## Sección 1: Frontend (Angular)

**Propósito:** Esta sección permite levantar la interfaz de usuario del proyecto mediante Angular CLI.

### Pasos para la instalación

1.  **Instalación de dependencias:**
    * Ejecutar el siguiente comando dentro del directorio del frontend:
      ```
      npm install
      ```

2.  **Ejecución del servidor local:**
    * Una vez instaladas las dependencias, iniciar el servidor de desarrollo con:
      ```
      ng serve -o
      ```
    * Esto abrirá automáticamente el proyecto en el navegador.

---

## Sección 2: Backend (Laravel)

**Propósito:** Esta sección configura y ejecuta el entorno de servidor de la aplicación, incluyendo las variables de entorno, conexión a base de datos y claves de aplicación.

### Pasos para la instalación y configuración

1.  **Instalación de dependencias:**
    * Dentro del directorio del backend, ejecutar:
      ```
      composer install
      ```

2.  **Creación y configuración del archivo de entorno (.env):**
    * Copiar el archivo de ejemplo y crear el archivo `.env` con el comando:
      ```
      cp .env.example .env
      ```
    * Reemplazar el contenido del nuevo archivo con el siguiente:

      ```
      APP_NAME=Laravel
      APP_ENV=local
      APP_KEY=base64:CMFse1S5VVcXZEYQ+ccCO2ocKCKxA7SjPsCbjPkjf3I=
      APP_DEBUG=true
      APP_URL=http://localhost

      APP_LOCALE=en
      APP_FALLBACK_LOCALE=en
      APP_FAKER_LOCALE=en_US

      APP_MAINTENANCE_DRIVER=file
      APP_MAINTENANCE_STORE=database

      PHP_CLI_SERVER_WORKERS=4
      BCRYPT_ROUNDS=12

      LOG_CHANNEL=stack
      LOG_STACK=single
      LOG_DEPRECATIONS_CHANNEL=null
      LOG_LEVEL=debug

      DB_CONNECTION=mysql
      DB_HOST=127.0.0.1
      DB_PORT=3306
      DB_DATABASE=bsdlogin
      DB_USERNAME=root
      DB_PASSWORD=

      SESSION_DRIVER=database
      SESSION_LIFETIME=120
      SESSION_ENCRYPT=false
      SESSION_PATH=/
      SESSION_DOMAIN=null

      BROADCAST_CONNECTION=log
      FILESYSTEM_DISK=local
      QUEUE_CONNECTION=database

      CACHE_STORE=database
      # CACHE_PREFIX=

      MEMCACHED_HOST=127.0.0.1

      REDIS_CLIENT=phpredis
      REDIS_HOST=127.0.0.1
      REDIS_PASSWORD=null
      REDIS_PORT=6379

      M


