<?php

namespace App\Http\Controllers;

use App\Models\Evento;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
* @OA\Schema(
*     schema="Evento",
*     type="object",
*     title="Evento",
*     @OA\Property(property="id", type="integer", example=1),
*     @OA\Property(property="user_id", type="integer", example=1),
*     @OA\Property(property="titulo", type="string", example="Cumpleaños"),
*     @OA\Property(property="descripcion", type="string", example="Fiesta sorpresa"),
*     @OA\Property(property="fecha_inicio", type="string", format="date", example="2025-11-30"),
*     @OA\Property(property="fecha_fin", type="string", format="date", example="2025-11-30"),
*     @OA\Property(property="etiqueta", type="string", example="Personal"),
*     @OA\Property(property="created_at", type="string", format="date-time"),
*     @OA\Property(property="updated_at", type="string", format="date-time")
* )
*/

class EventoController extends Controller
{
    /**
    * @OA\Get(
    *     path="/api/eventos",
    *     summary="Listar todos los eventos del usuario autenticado",
    *     tags={"Eventos"},
    *     security={{"sanctum":{}}},
    *     @OA\Response(
    *         response=200,
    *         description="Lista de eventos",
    *         @OA\JsonContent(
    *             type="array",
    *             @OA\Items(ref="#/components/schemas/Evento")
    *         )
    *     )
    * )
    */
    public function index()
    {
        $eventos = Evento::where('user_id', Auth::id())->get();
        return response()->json($eventos);
    }

    /**
    * @OA\Post(
    *     path="/api/eventos",
    *     summary="Crear un nuevo evento",
    *     tags={"Eventos"},
    *     security={{"sanctum":{}}},
    *     @OA\RequestBody(
    *         required=true,
    *         @OA\JsonContent(
    *             required={"titulo","fecha_inicio"},
    *             @OA\Property(property="titulo", type="string", example="Cumpleaños"),
    *             @OA\Property(property="descripcion", type="string", example="Fiesta sorpresa"),
    *             @OA\Property(property="fecha_inicio", type="string", format="date", example="2025-11-30"),
    *             @OA\Property(property="fecha_fin", type="string", format="date", example="2025-11-30"),
    *             @OA\Property(property="etiqueta", type="string", example="Personal")
    *         )
    *     ),
    *     @OA\Response(
    *         response=201,
    *         description="Evento creado correctamente",
    *         @OA\JsonContent(ref="#/components/schemas/Evento")
    *     )
    * )
    */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'titulo' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
            'etiqueta' => 'nullable|string|max:50',
        ]);

        $evento = Evento::create([
            'user_id' => Auth::id(),
            ...$validated
        ]);

        return response()->json($evento, 201);
    }

    /**
    * @OA\Get(
    *     path="/api/eventos/{id}",
    *     summary="Ver detalle de un evento",
    *     tags={"Eventos"},
    *     security={{"sanctum":{}}},
    *     @OA\Parameter(
    *         name="id",
    *         in="path",
    *         description="ID del evento",
    *         required=true,
    *         @OA\Schema(type="integer")
    *     ),
    *     @OA\Response(
    *         response=200,
    *         description="Detalle del evento",
    *         @OA\JsonContent(ref="#/components/schemas/Evento")
    *     ),
    *     @OA\Response(
    *         response=404,
    *         description="Evento no encontrado"
    *     )
    * )
    */
    public function show($id)
    {
        $evento = Evento::where('user_id', Auth::id())->findOrFail($id);
        return response()->json($evento);
    }

    /**
    * @OA\Put(
    *     path="/api/eventos/{id}",
    *     summary="Actualizar un evento",
    *     tags={"Eventos"},
    *     security={{"sanctum":{}}},
    *     @OA\Parameter(
    *         name="id",
    *         in="path",
    *         description="ID del evento a actualizar",
    *         required=true,
    *         @OA\Schema(type="integer")
    *     ),
    *     @OA\RequestBody(
    *         required=true,
    *         @OA\JsonContent(
    *             @OA\Property(property="titulo", type="string", example="Cumpleaños actualizado"),
    *             @OA\Property(property="descripcion", type="string", example="Fiesta sorpresa con amigos"),
    *             @OA\Property(property="fecha_inicio", type="string", format="date", example="2025-11-30"),
    *             @OA\Property(property="fecha_fin", type="string", format="date", example="2025-11-30"),
    *             @OA\Property(property="etiqueta", type="string", example="Trabajo")
    *         )
    *     ),
    *     @OA\Response(
    *         response=200,
    *         description="Evento actualizado correctamente",
    *         @OA\JsonContent(ref="#/components/schemas/Evento")
    *     ),
    *     @OA\Response(
    *         response=404,
    *         description="Evento no encontrado"
    *     )
    * )
    */
    public function update(Request $request, $id)
    {
        $evento = Evento::where('user_id', Auth::id())->findOrFail($id);

        $validated = $request->validate([
            'titulo' => 'sometimes|required|string|max:255',
            'descripcion' => 'nullable|string',
            'fecha_inicio' => 'sometimes|required|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
            'etiqueta' => 'nullable|string|max:50',
        ]);

        $evento->update($validated);

        return response()->json($evento);
    }

    /**
    * @OA\Delete(
    *     path="/api/eventos/{id}",
    *     summary="Eliminar un evento",
    *     tags={"Eventos"},
    *     security={{"sanctum":{}}},
    *     @OA\Parameter(
    *         name="id",
    *         in="path",
    *         description="ID del evento a eliminar",
    *         required=true,
    *         @OA\Schema(type="integer")
    *     ),
    *     @OA\Response(
    *         response=200,
    *         description="Evento eliminado correctamente",
    *         @OA\JsonContent(
    *             @OA\Property(property="message", type="string", example="Evento eliminado correctamente")
    *         )
    *     ),
    *     @OA\Response(
    *         response=404,
    *         description="Evento no encontrado"
    *     )
    * )
    */
    public function destroy($id)
    {
        $evento = Evento::where('user_id', Auth::id())->findOrFail($id);
        $evento->delete();

        return response()->json(['message' => 'Evento eliminado correctamente']);
    }
}


