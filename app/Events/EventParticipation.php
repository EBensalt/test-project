<?php

namespace App\Events;

use App\Models\Event;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EventParticipation
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $event;
    public $participant;

    /**
     * Create a new event instance.
     */
    public function __construct(Event $event, User $participant)
    {
        $this->event = $event;
        $this->participant = $participant;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel("event-participation.{$this->event->user_id}")
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'event' => $this->event,
            'participant' => [
                'email' => $this->participant->email
            ],
            'message' => "{$this->participant->email} has joined your event: {$this->event->title}"
        ];
    }
}
