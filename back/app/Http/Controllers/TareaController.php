<?php

namespace App\Http\Controllers;

use App\Models\Tarea;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
* @OA\Schema(
*     schema="Tarea",
*     type="object",
*     title="Tarea",
*     @OA\Property(property="id", type="integer", example=1),
*     @OA\Property(property="user_id", type="integer", example=1),
*     @OA\Property(property="titulo", type="string", example="Comprar pan"),
*     @OA\Property(property="descripcion", type="string", example="Ir a la panadería a comprar pan"),
*     @OA\Property(property="fecha_limite", type="string", format="date", example="2025-11-30"),
*     @OA\Property(property="estado", type="string", example="pendiente"),
*     @OA\Property(property="created_at", type="string", format="date-time"),
*     @OA\Property(property="updated_at", type="string", format="date-time")
* )
*/
class TareaController extends Controller
{
    /**
    * @OA\Get(
    *     path="/api/tareas",
    *     summary="Listar todas las tareas del usuario autenticado",
    *     tags={"Tareas"},
    *     security={{"sanctum":{}}},
    *     @OA\Parameter(
    *         name="estado",
    *         in="query",
    *         description="Filtrar por estado de la tarea (pendiente/completada)",
    *         required=false,
    *         @OA\Schema(type="string")
    *     ),
    *     @OA\Parameter(
    *         name="fecha",
    *         in="query",
    *         description="Filtrar por fecha límite de la tarea",
    *         required=false,
    *         @OA\Schema(type="string", format="date")
    *     ),
    *     @OA\Response(
    *         response=200,
    *         description="Lista de tareas",
    *         @OA\JsonContent(
    *             type="array",
    *             @OA\Items(ref="#/components/schemas/Tarea")
    *         )
    *     )
    * )
    */
    public function index(Request $request)
    {
        $query = Tarea::where('user_id', Auth::id());

        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->has('fecha')) {
            $query->whereDate('fecha_limite', $request->fecha);
        }

        $tareas = $query->get();
        return response()->json($tareas);
    }

    /**
    * @OA\Post(
    *     path="/api/tareas",
    *     summary="Crear una nueva tarea",
    *     tags={"Tareas"},
    *     security={{"sanctum":{}}},
    *     @OA\RequestBody(
    *         required=true,
    *         @OA\JsonContent(
    *             required={"titulo"},
    *             @OA\Property(property="titulo", type="string", example="Comprar pan"),
    *             @OA\Property(property="descripcion", type="string", example="Ir a la panadería a comprar pan"),
    *             @OA\Property(property="fecha_limite", type="string", format="date", example="2025-11-30"),
    *             @OA\Property(property="estado", type="string", example="pendiente")
    *         )
    *     ),
    *     @OA\Response(
    *         response=201,
    *         description="Tarea creada correctamente",
    *         @OA\JsonContent(ref="#/components/schemas/Tarea")
    *     )
    * )
    */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'titulo' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'fecha_limite' => 'nullable|date',
            'estado' => 'nullable|in:pendiente,completada'
        ]);

        $validated['user_id'] = Auth::id();

        $tarea = Tarea::create($validated);
        return response()->json($tarea, 201);
    }

    /**
    * @OA\Get(
    *     path="/api/tareas/{id}",
    *     summary="Ver detalle de una tarea",
    *     tags={"Tareas"},
    *     security={{"sanctum":{}}},
    *     @OA\Parameter(
    *         name="id",
    *         in="path",
    *         description="ID de la tarea",
    *         required=true,
    *         @OA\Schema(type="integer")
    *     ),
    *     @OA\Response(
    *         response=200,
    *         description="Detalle de la tarea",
    *         @OA\JsonContent(ref="#/components/schemas/Tarea")
    *     ),
    *     @OA\Response(
    *         response=404,
    *         description="Tarea no encontrada"
    *     )
    * )
    */
    public function show($id)
    {
        $tarea = Tarea::where('user_id', Auth::id())->findOrFail($id);
        return response()->json($tarea);
    }

    /**
    * @OA\Put(
    *     path="/api/tareas/{id}",
    *     summary="Actualizar una tarea",
    *     tags={"Tareas"},
    *     security={{"sanctum":{}}},
    *     @OA\Parameter(
    *         name="id",
    *         in="path",
    *         description="ID de la tarea a actualizar",
    *         required=true,
    *         @OA\Schema(type="integer")
    *     ),
    *     @OA\RequestBody(
    *         required=true,
    *         @OA\JsonContent(
    *             @OA\Property(property="titulo", type="string", example="Comprar pan actualizado"),
    *             @OA\Property(property="descripcion", type="string", example="Ir a la panadería y comprar pan y leche"),
    *             @OA\Property(property="fecha_limite", type="string", format="date", example="2025-11-30"),
    *             @OA\Property(property="estado", type="string", example="completada")
    *         )
    *     ),
    *     @OA\Response(
    *         response=200,
    *         description="Tarea actualizada correctamente",
    *         @OA\JsonContent(ref="#/components/schemas/Tarea")
    *     ),
    *     @OA\Response(
    *         response=404,
    *         description="Tarea no encontrada"
    *     )
    * )
    */
    public function update(Request $request, $id)
    {
        $tarea = Tarea::where('user_id', Auth::id())->findOrFail($id);

        $validated = $request->validate([
            'titulo' => 'sometimes|required|string|max:255',
            'descripcion' => 'nullable|string',
            'fecha_limite' => 'nullable|date',
            'estado' => 'nullable|in:pendiente,completada'
        ]);

        $tarea->update($validated);
        return response()->json($tarea);
    }

    /**
    * @OA\Delete(
    *     path="/api/tareas/{id}",
    *     summary="Eliminar una tarea",
    *     tags={"Tareas"},
    *     security={{"sanctum":{}}},
    *     @OA\Parameter(
    *         name="id",
    *         in="path",
    *         description="ID de la tarea a eliminar",
    *         required=true,
    *         @OA\Schema(type="integer")
    *     ),
    *     @OA\Response(
    *         response=200,
    *         description="Tarea eliminada correctamente",
    *         @OA\JsonContent(
    *             @OA\Property(property="message", type="string", example="Tarea eliminada correctamente")
    *         )
    *     ),
    *     @OA\Response(
    *         response=404,
    *         description="Tarea no encontrada"
    *     )
    * )
    */
    public function destroy($id)
    {
        $tarea = Tarea::where('user_id', Auth::id())->findOrFail($id);
        $tarea->delete();

        return response()->json(['message' => 'Tarea eliminada correctamente']);
    }
}
