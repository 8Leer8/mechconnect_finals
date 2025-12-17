# Request Acceptance Flow - Fixed

## Problem
When a mechanic accepted a client's request, no booking was being created in the database. This caused the request to change status to "accepted" but never show up in the client's Active Bookings.

## Root Causes

### 1. Backend Issue
The `update_request_status()` endpoint in `backend/requests/views.py` (line 210) was only updating the request status but **not creating a Booking record**.

```python
# OLD CODE (broken)
def update_request_status(request, request_id):
    req.request_status = new_status
    req.save()
    # No booking creation!
```

### 2. Frontend Issue  
The mechanic's "Accept" button in both:
- `frontend/mechconnect/src/pages/mechanic/home.tsx`
- `frontend/mechconnect/src/pages/mechanic/jobs/index.tsx`

...had commented-out API calls with the comment "In a real app, this would make an API call". They were only updating local state, not calling the backend.

```typescript
// OLD CODE (broken)
const handleAcceptRequest = async (requestId: number) => {
  // In a real app, this would make an API call
  setPendingRequests(prev => prev.filter(req => req.request_id !== requestId));
  // No actual backend call!
};
```

## Solutions Implemented

### 1. Backend Fix - `backend/requests/views.py`

Added automatic booking creation when request status changes to 'accepted':

```python
def update_request_status(request, request_id):
    """
    Update the status of a request
    When status is changed to 'accepted', automatically create a booking
    """
    # ... validation code ...
    
    # Update request status
    old_status = req.request_status
    req.request_status = new_status
    req.save()
    
    # If status changed to 'accepted', create a booking
    if new_status == 'accepted' and old_status != 'accepted':
        from bookings.models import Booking
        
        # Check if booking already exists
        existing_booking = Booking.objects.filter(request=req).first()
        
        if not existing_booking:
            # Create new booking with 'active' status
            booking = Booking.objects.create(
                request=req,
                status='active',
                amount_fee=0
            )
            
            # Return booking data in response
            response_data['booking'] = booking_serializer.data
            response_data['message'] = 'Request accepted and booking created successfully'
```

### 2. Frontend Fix - `frontend/mechconnect/src/pages/mechanic/home.tsx`

Added import and actual API call:

```typescript
import { requestsAPI } from '../../utils/api';

const handleAcceptRequest = async (requestId: number) => {
  try {
    const result = await requestsAPI.updateRequestStatus(requestId, 'accepted');
    
    if (result.error) {
      setToastMessage(result.error);
      setShowToast(true);
      return;
    }
    
    // Remove from pending list on success
    setPendingRequests(prev => prev.filter(req => req.request_id !== requestId));
    setToastMessage('Request accepted successfully! Booking created.');
    setShowToast(true);
  } catch (error) {
    console.error('Error accepting request:', error);
    setToastMessage('Failed to accept request');
    setShowToast(true);
  }
};
```

### 3. Frontend Fix - `frontend/mechconnect/src/pages/mechanic/jobs/index.tsx`

Same fix as above - added import and actual API call.

## Complete Flow (Now Working)

1. **Client Creates Request**
   - Client submits a service request
   - Request is saved with status='pending'

2. **Mechanic Views Request**
   - Mechanic sees pending request in their dashboard or jobs page

3. **Mechanic Accepts Request** (FIXED)
   - Frontend calls `requestsAPI.updateRequestStatus(requestId, 'accepted')`
   - Backend `update_request_status()` endpoint:
     - Changes request status to 'accepted'
     - **Creates a new Booking with status='active'** ✅
     - Returns success with booking data

4. **Client Sees Active Booking** (NOW WORKS)
   - Client navigates to Bookings → Active tab
   - Frontend calls `bookingsAPI.getClientBookings(clientId, 'active')`
   - Backend returns all active bookings including the newly created one
   - Client sees their accepted request as an active booking ✅

## Files Modified

1. `backend/requests/views.py` (lines 210-268)
   - Added booking creation logic in `update_request_status()`

2. `frontend/mechconnect/src/pages/mechanic/home.tsx` (lines 1-85)
   - Added `requestsAPI` import
   - Implemented actual API call in `handleAcceptRequest()`
   - Implemented actual API call in `handleDeclineRequest()`

3. `frontend/mechconnect/src/pages/mechanic/jobs/index.tsx` (lines 1-385)
   - Added `requestsAPI` import
   - Implemented actual API call in `handleAcceptRequest()`
   - Implemented actual API call in `handleDeclineRequest()`

## Testing

Test data shows the fix works:
- Request 26 (cyrellrafaelfelix@gmail.com): Reset to 'pending'
- When accepted via API, booking is created automatically
- Client can see the booking in their Active Bookings list

## Summary

The issue was that accepting a request only changed its status but didn't create a booking record. Now:
- ✅ Backend automatically creates a booking when request is accepted
- ✅ Frontend actually calls the backend API instead of just updating local state
- ✅ Client can see accepted requests as active bookings
- ✅ Complete request-to-booking flow is now working end-to-end
