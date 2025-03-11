@component('mail::message')
# New Event Participation Notification

Hello {{ $event->user->email }},

A new participant has joined your event!

## Event Details
- Title: {{ $event->title }}
- Date: {{ Carbon\Carbon::parse($event->date)->format('F j, Y, g:i a') }}
- Location: {{ $event->location }}

## Participant Details
- Email: {{ $participant->email }}
- Current Participants: {{ $event->participants()->count() }}/{{ $event->max_participants }}

Thanks,<br>
{{ config('app.name') }}
@endcomponent
