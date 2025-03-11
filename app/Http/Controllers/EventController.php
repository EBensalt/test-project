<?php

namespace App\Http\Controllers;

use App\Events\EventCreated;
use App\Mail\ParticipationNotification;
use App\Models\Event;
use App\Models\User;
use Illuminate\Http\Request;
use Validator;
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail;

class EventController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $userId = auth()->id();
            $events = Event::with('user:id,email')
                ->withCount('participants')
                ->with(['participants' => function($query) use ($userId) {
                    $query->where('user_id', $userId);
                }])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($event) {
                    $event->is_participating = $event->participants->isNotEmpty();
                    unset($event->participants);
                    return $event;
                });
            
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
            'max_participants.min' => 'The maximum participants must be at least 1.'
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
            "max_participants" => "required|integer|min:1"
        ], $messages);

        if ($validator->fails()) {
            return response()->json([
                "status" => false,
                "message" => "Validation Error",
                "error" => $validator->errors()
            ], 422);
        }
        try {
            $data = array_merge(
                $validator->validated(), 
                ['user_id' => auth()->id()]
            );

            $event = Event::create($data);
            broadcast(new EventCreated($event))->toOthers();

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

    public function participate(string $id)
    {
        try {
            $event = Event::findOrFail($id);

            if ($event->user_id == auth()->id()) {
                return response()->json([
                    'status' => false,
                    'message' => 'You cannot participate in your own event'
                ], 400);
            }
            if ($event->participants()->count() >= $event->max_participants) {
                return response()->json([
                    'status' => false,
                    'message' => 'Event is already full'
                ], 400);
            }
            if ($event->participants()->where('user_id', auth()->id())->exists()) {
                return response()->json([
                    'status' => false,
                    'message' => 'You are already participating in this event'
                ], 400);
            }
            $event->participants()->attach(auth()->id());
            $organizer = User::find($event->user_id);

            Mail::to($organizer)->send(new ParticipationNotification($event, auth()->user()));
            return response()->json([
                'status' => true,
                'message' => 'Successfully joined the event',
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to join event',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
