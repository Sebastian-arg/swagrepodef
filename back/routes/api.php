<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EventoController;
use App\Http\Controllers\TareaController;


Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
});
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/eventos', [EventoController::class, 'index']);
    Route::post('/eventos', [EventoController::class, 'store']);
    Route::get('/eventos/{id}', [EventoController::class, 'show']);
    Route::put('/eventos/{id}', [EventoController::class, 'update']);
    Route::delete('/eventos/{id}', [EventoController::class, 'destroy']);

    Route::get('/tareas', [TareaController::class, 'index']);
    Route::post('/tareas', [TareaController::class, 'store']);
    Route::get('/tareas/{id}', [TareaController::class, 'show']);
    Route::put('/tareas/{id}', [TareaController::class, 'update']);
    Route::delete('/tareas/{id}', [TareaController::class, 'destroy']);


});

