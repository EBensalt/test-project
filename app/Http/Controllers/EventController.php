<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Validator;
use Carbon\Carbon;

class EventController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $events = Event::orderBy('created_at', 'desc')->get();
            
            return response()->json([
                'status' => true,
                'message' => 'Events retrieved successfully',
                'data' => $events
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to retrieve events',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $messages = [
            'title.required' => 'The title field is required.',
            'title.string' => 'The title must be a string.',
            'title.max' => 'The title cannot exceed 255 characters.',
            'description.string' => 'The description must be a string.',
            'date.required' => 'The date field is required.',
            'date.date' => 'Please enter a valid date.',
            'location.required' => 'The location field is required.',
            'location.string' => 'The location must be a string.',
            'location.max' => 'The location cannot exceed 255 characters.',
            'max_participants.required' => 'The maximum participants field is required.',
            'max_participants.integer' => 'The maximum participants must be a number.',
            'max_participants.min' => 'The maximum participants must be at least 1.',
            "user_id.required" => "Authentication required: Please log in to create an event.",
            "user_id.integer" => "Authentication error: Invalid user credentials.",
        ];
        $validator = Validator::make($request->all(), [
            "title" => "required|string|max:255",
            "description" => "nullable|string",
            "date" => ["required", "date", function($attribute, $value, $fail) {
                $eventDate = Carbon::parse($value)->startOfDay();
                $today = Carbon::now()->startOfDay();

                if ($eventDate->lt($today))
                    $fail('The event date must be today or a future date.');
            }],
            "location" => "required|string|max:255",
            "max_participants" => "required|integer|min:1",
            "user_id" => "required|integer"
        ], $messages);

        if ($validator->fails()) {
            return response()->json([
                "status" => false,
                "message" => "Validation Error",
                "error" => $validator->errors()
            ], 422);
        }
        try {
            $event = Event::create($validator->validated());

            return response()->json([
                "status" => true,
                "message" => "Event created successfully",
                "data" => $event
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                "status" => true,
                "message" => "Event creation failed",
                "error" => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
