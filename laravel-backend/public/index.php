<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Locate the Laravel installation directory
// In local dev: __DIR__ . '/..'
// In cPanel production: __DIR__ is ~/lutatech.com/api/, core is in ~/laravel-backend/
$possiblePaths = [
    __DIR__ . '/..',
    __DIR__ . '/../../laravel-backend',
    dirname(dirname(__DIR__)) . '/laravel-backend',
    (isset($_SERVER['DOCUMENT_ROOT']) ? dirname($_SERVER['DOCUMENT_ROOT']) . '/laravel-backend' : null),
];

$basePath = null;
foreach ($possiblePaths as $path) {
    if ($path && file_exists($path . '/vendor/autoload.php')) {
        $basePath = realpath($path);
        break;
    }
}

if (!$basePath) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Laravel core vendor autoload not found.',
        'checked_paths' => array_filter($possiblePaths),
    ]);
    exit(1);
}

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = $basePath . '/storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require $basePath . '/vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once $basePath . '/bootstrap/app.php';

$app->handleRequest(Request::capture());
