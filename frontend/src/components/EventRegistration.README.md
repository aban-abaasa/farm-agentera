# Event Registration System

This system provides complete event registration functionality for the Farm Agent community platform.

## Features

- **User Registration/Unregistration**: Users can register and unregister for events
- **Registration Status Check**: Check if a user is already registered for an event
- **Capacity Management**: Prevents registration when events are full
- **Real-time UI Updates**: Immediate feedback on registration changes
- **Authentication Integration**: Seamless integration with the auth system
- **Error Handling**: Comprehensive error handling and user feedback

## Components

### 1. Database Functions (communityService.js)

#### `registerForEvent(eventId, userId)`
- Registers a user for an event
- Checks for existing registration
- Validates event capacity and status
- Returns success/error response

#### `unregisterFromEvent(eventId, userId)`
- Removes user registration from an event
- Returns success/error response

#### `getUserEventRegistration(eventId, userId)`
- Checks if user is registered for an event
- Returns registration status and details

#### `getEventParticipantsCount(eventId)`
- Gets current participant count for an event
- Used for capacity checking and UI display

### 2. React Hook (useEventRegistration.js)

The `useEventRegistration` hook provides:

```javascript
const {
  isRegistered,        // Boolean: user registration status
  isLoading,          // Boolean: loading state
  registrationData,   // Object: registration details
  error,              // String: error message
  isLoggedIn,         // Boolean: user authentication status
  handleRegister,     // Function: register for event
  handleUnregister,   // Function: unregister from event
  toggleRegistration, // Function: toggle registration status
  clearError,         // Function: clear error state
  registrationButtonText, // String: button text based on state
  canRegister         // Boolean: whether user can register
} = useEventRegistration(eventId);
```

### 3. UI Component (EventRegistrationButton.jsx)

A ready-to-use button component with:
- Automatic state management
- Loading indicators
- Tooltips
- Snackbar notifications
- Customizable styling

```jsx
<EventRegistrationButton 
  eventId={event.id}
  variant="contained"
  size="small"
  color="primary"
  onRegistrationChange={(action, eventId) => {
    // Handle registration change
  }}
/>
```

## Usage

### Basic Implementation

1. **Import the component**:
```javascript
import EventRegistrationButton from '../../components/EventRegistrationButton';
```

2. **Use in your event cards**:
```jsx
<EventRegistrationButton 
  eventId={event.id}
  onRegistrationChange={(action, eventId) => {
    // Update local state if needed
    updateEventAttendees(eventId, action);
  }}
/>
```

### Advanced Usage with Custom Hook

```javascript
import { useEventRegistration } from '../hooks/useEventRegistration';

const MyEventComponent = ({ eventId }) => {
  const {
    isRegistered,
    isLoading,
    toggleRegistration,
    error
  } = useEventRegistration(eventId);

  return (
    <div>
      <p>Status: {isRegistered ? 'Registered' : 'Not Registered'}</p>
      <button onClick={toggleRegistration} disabled={isLoading}>
        {isLoading ? 'Loading...' : (isRegistered ? 'Unregister' : 'Register')}
      </button>
      {error && <p>Error: {error}</p>}
    </div>
  );
};
```

## Database Schema

The event registration system requires these tables:

### `community_events`
- `id` (Primary Key)
- `title`, `description`, `event_type`
- `start_datetime`, `end_datetime`
- `location`, `max_participants`
- `status` ('upcoming', 'cancelled', etc.)
- `organizer_id` (Foreign Key to users)

### `event_participants`
- `id` (Primary Key)
- `event_id` (Foreign Key to community_events)
- `user_id` (Foreign Key to users)
- `registration_date`
- `status` ('registered', 'cancelled', etc.)
- Unique constraint on (event_id, user_id)

## Error Handling

The system handles various error cases:

- **Already Registered**: Prevents duplicate registrations
- **Event Full**: Checks capacity before registration
- **Event Cancelled**: Prevents registration for cancelled events
- **Authentication Required**: Prompts login for unauthenticated users
- **Network Errors**: Graceful handling of API failures

## Security

- **Row Level Security**: Database policies ensure users can only manage their own registrations
- **Authentication**: All registration actions require valid authentication
- **Validation**: Server-side validation of all registration requests

## Future Enhancements

Potential improvements:
- Waitlist functionality for full events
- Email notifications for registration confirmations
- Calendar integration
- Registration deadlines
- Payment integration for paid events
- Bulk registration management for organizers

## Testing

To test the functionality:

1. **Set up test events** in the database
2. **Log in as different users** to test registration
3. **Test capacity limits** by setting max_participants
4. **Test error scenarios** (network issues, unauthorized access)
5. **Verify real-time updates** in the UI

## Integration Notes

This system integrates with:
- **AuthContext**: For user authentication
- **Supabase**: For database operations
- **Material-UI**: For UI components
- **Community Events Page**: For event display and registration

The implementation is designed to be modular and reusable across different parts of the application.
