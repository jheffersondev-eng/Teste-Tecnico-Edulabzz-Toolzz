<?php

namespace App\Swagger;

use OpenApi\Annotations as OA;

/**
 * @OA\OpenApi(
 *   @OA\Info(
 *     title="Chat API",
 *     version="1.0.0",
 *     description="API documentation for the Chat application"
 *   ),
 *   @OA\Server(url="http://localhost", description="Local")
 * )
 *
 * @OA\SecurityScheme(
 *   securityScheme="bearerAuth",
 *   type="http",
 *   scheme="bearer",
 *   bearerFormat="JWT"
 * )
 */
class OpenApi
{
}
