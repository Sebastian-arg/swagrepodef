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

**Propósito:** Esta sección configura y ejecuta el entorno de servidor de la aplicación, incluyendo las variables de entorno, conexión a base de datos, claves de aplicación y documentación con Swagger.

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

      MAIL_MAILER=log
      MAIL_SCHEME=null
      MAIL_HOST=127.0.0.1
      MAIL_PORT=2525
      MAIL_USERNAME=null
      MAIL_PASSWORD=null
      MAIL_FROM_ADDRESS="hello@example.com"
      MAIL_FROM_NAME="${APP_NAME}"

      AWS_ACCESS_KEY_ID=
      AWS_SECRET_ACCESS_KEY=
      AWS_DEFAULT_REGION=us-east-1
      AWS_BUCKET=
      AWS_USE_PATH_STYLE_ENDPOINT=false

      VITE_APP_NAME="${APP_NAME}"
      ```

3.  **Generar la clave de aplicación:**
    * Ejecutar el siguiente comando:
      ```
      php artisan key:generate
      ```

4.  **Iniciar el servidor local de Laravel:**
    * Finalmente, ejecutar:
      ```
      php artisan serve
      ```

---

## Sección 3: Configuración de Swagger con Autenticación JWT

**Propósito:** Agregar documentación interactiva para la API usando Swagger, con soporte para autenticación mediante tokens JWT.

### Pasos para instalar y configurar Swagger

1. **Instalar el paquete L5-Swagger**
   ```
   composer require "darkaonline/l5-swagger"
   ```

2. **Publicar la configuración del proveedor de servicios**
   ```
   php artisan vendor:publish --provider "L5Swagger\L5SwaggerServiceProvider"
   ```

   Esto genera el archivo `config/l5-swagger.php` y define la ruta:
   ```
   http://tu-dominio/api/documentation
   ```

3. **Agregar la configuración principal en el controlador principal de la API**

   Pegar lo siguiente al inicio del controlador (por ejemplo, `Controller.php`):
   ```php
   /**
    * @OA\Info(
    *     version="1.0.0",
    *     title="API en Laravel",
    *     description="Documentación de la API con Swagger en Laravel"
    * )
    *
    * @OA\Server(
    *     url="http://127.0.0.1:8000",
    *     description="Servidor local"
    * )
    *
    * @OA\SecurityScheme(
    *     securityScheme="bearerAuth",
    *     type="http",
    *     scheme="bearer",
    *     bearerFormat="JWT",
    *     description="Usa un token JWT para autenticar"
    * )
    */
   ```

4. **Agregar anotaciones en cada controlador o endpoint**
   Ejemplo de anotación en un método `index`:
   ```php
   /**
    * @OA\Get(
    *     path="/api/productos",
    *     summary="Obtener lista de productos",
    *     tags={"Productos"},
    *     security={{"bearerAuth":{}}},
    *     @OA\Response(
    *         response=200,
    *         description="Lista de productos obtenida correctamente"
    *     ),
    *     @OA\Response(
    *         response=401,
    *         description="No autorizado - Token ausente o inválido"
    *     )
    * )
    */
   ```

5. **Proteger las rutas con JWT**
   En `routes/api.php`:
   ```php
   Route::post('/register', [AuthController::class, 'register']);
   Route::post('/login', [AuthController::class, 'login']);

   Route::group(['middleware' => ['jwt.auth']], function () {
       Route::get('me', [AuthController::class, 'me']);
       Route::post('logout', [AuthController::class, 'logout']);
       Route::apiResource('productos', ProductoController::class);
   });
   ```

6. **Generar la documentación**
   ```
   php artisan l5-swagger:generate
   ```

7. **Acceder a la documentación**
   Luego de generar los archivos, la documentación estará disponible en:
   ```
   http://localhost:8000/api/documentation
   ```

8. **Regenerar la documentación**
   Cada vez que se modifiquen o agreguen anotaciones:
   ```
   php artisan l5-swagger:generate
   ```

---

## Resultado Final

* El **frontend Angular** estará disponible en:  
  [http://localhost:4200](http://localhost:4200)

* El **backend Laravel** funcionará en:  
  [http://localhost:8000](http://localhost:8000)

* La **documentación Swagger con autenticación JWT** estará disponible en:  
  [http://localhost:8000/api/documentation](http://localhost:8000/api/documentation)

---

## Enlaces

* [Repositorio del Proyecto](https://github.com/mary-s-rgb)
* [Documentación de Angular](https://angular.io/docs)
* [Documentación de Laravel](https://laravel.com/docs)
* [L5-Swagger (Laravel Swagger)](https://github.com/DarkaOnLine/L5-Swagger)
* [Swagger Oficial](https://swagger.io/)
