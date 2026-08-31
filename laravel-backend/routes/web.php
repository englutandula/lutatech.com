<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Secret route to run migrations on Namecheap automatically
Route::get('/setup-database', function () {
    try {
        $dbPath = database_path('database.sqlite');
        
        if (!file_exists($dbPath)) {
            touch($dbPath);
            chmod($dbPath, 0666);
        }
        
        \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Database created and migrated automatically!',
            'output' => \Illuminate\Support\Facades\Artisan::output()
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage()
        ], 500);
    }
});
