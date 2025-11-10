<?php

namespace App\Http\Controllers;

use App\Models\Pomodoro;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * @OA\Info(
 *      version="1.0.0",
 *      title="Mi Agenda API",
 *      description="API para la aplicación Mi Agenda"
 * )
 */
class PomodoroController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/pomodoros",
     *     summary="Guarda una sesión de pomodoro completada",
     *     tags={"Pomodoros"},
     *     security={{"sanctum": {}}},
     *     @OA\Response(
     *         response=201,
     *         description="Sesión de pomodoro guardada exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer", example=1),
     *             @OA\Property(property="user_id", type="integer", example=1),
     *             @OA\Property(property="created_at", type="string", format="date-time"),
     *             @OA\Property(property="updated_at", type="string", format="date-time")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="No autenticado"
     *     )
     * )
     */
    public function store(Request $request)
    {
        $pomodoro = new Pomodoro();
        $pomodoro->user_id = Auth::id();
        $pomodoro->save();

        return response()->json($pomodoro, 201);
    }
}
