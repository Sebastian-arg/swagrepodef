<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

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
*/

/**
 * @OA\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT"
 * )
 */


class AuthController extends Controller
{

    /**
    * @OA\Post(
    *     path="/api/login",
    *     summary="Iniciar sesión",
    *     tags={"Autenticación"},
    *     @OA\RequestBody(
    *         required=true,
    *         @OA\JsonContent(
    *             required={"email","password"},
    *             @OA\Property(property="email", type="string", example="test@example.com"),
    *             @OA\Property(property="password", type="string", example="123456")
    *         )
    *     ),
    *     @OA\Response(
    *         response=200,
    *         description="Login correcto",
    *         @OA\JsonContent(
    *              @OA\Property(property="success", type="boolean", example=true),
    *              @OA\Property(property="user", type="object"),
    *              @OA\Property(property="token", type="string", example="abc123")
    *         )
    *     ),
    *     @OA\Response(
    *         response=401,
    *         description="Credenciales incorrectas",
    *         @OA\JsonContent(
    *             @OA\Property(property="success", type="boolean", example=false),
    *             @OA\Property(property="message", type="string", example="Credenciales incorrectas")
    *         )
    *     )
    * )
    */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Credenciales incorrectas'
            ], 401);
        }

        $token = $user->createToken('token')->plainTextToken;

        return response()->json([
            'success' => true,
            'user' => $user,
            'token' => $token
        ]);
    }

    /**
    * @OA\Post(
    *     path="/api/register",
    *     summary="Registrar un nuevo usuario",
    *     tags={"Autenticación"},
    *     @OA\RequestBody(
    *         required=true,
    *         @OA\JsonContent(
    *             required={"name","email","password"},
    *             @OA\Property(property="name", type="string", example="Sebastián"),
    *             @OA\Property(property="email", type="string", example="sebastian@mail.com"),
    *             @OA\Property(property="password", type="string", example="123456")
    *         )
    *     ),
    *     @OA\Response(
    *         response=201,
    *         description="Registro correcto",
    *         @OA\JsonContent(
    *             @OA\Property(property="success", type="boolean", example=true),
    *             @OA\Property(property="user", type="object"),
    *             @OA\Property(property="token", type="string", example="abc123")
    *         )
    *     )
    * )
    */
    public function register(Request $request)
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password)
        ]);

        $token = $user->createToken('token')->plainTextToken;

        return response()->json([
            'success' => true,
            'user' => $user,
            'token' => $token
        ], 201);
    }


    /**
    * @OA\Post(
    *     path="/api/logout",
    *     summary="Cerrar sesión del usuario",
    *     security={{"sanctum":{}}},
    *     tags={"Autenticación"},
    *     @OA\Response(
    *         response=200,
    *         description="Logout correcto",
    *         @OA\JsonContent(
    *             @OA\Property(property="success", type="boolean", example=true),
    *             @OA\Property(property="message", type="string", example="Sesión cerrada correctamente")
    *         )
    *     )
    * )
    */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sesión cerrada correctamente'
        ]);
    }
}
