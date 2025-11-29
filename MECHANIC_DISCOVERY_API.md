# Mechanic Discovery API Documentation

## Endpoint: Get All Mechanics for Discovery

**URL:** `/api/accounts/discover/mechanics/`
**Method:** `GET`
**Authentication:** Not required (AllowAny)

### Description
This endpoint returns all available mechanics for the discovery page, formatted to match the UI requirements shown in the provided image.

### Query Parameters (Optional)
- `city` (string): Filter mechanics by city
- `ranking` (string): Filter by ranking (standard, bronze, silver, gold)
- `status` (string): Filter by status (available, working)
- `page` (integer): Page number for pagination (default: 1)
- `page_size` (integer): Number of mechanics per page (default: 10)

### Response Format

#### Success Response (200 OK)
```json
{
    "message": "Mechanics found",
    "mechanics": [
        {
            "acc_id": 1,
            "full_name": "Mike Johnson",
            "profile_photo": "url_to_photo_or_null",
            "bio": "Independent Mechanic with 5+ years experience in automotive repair",
            "average_rating": "4.80",
            "ranking": "gold",
            "location": "Tarlac, Tarlac",
            "total_jobs": 240,
            "contact_number": "+639171234567",
            "status": "available"
        }
    ],
    "total_count": 1,
    "page": 1,
    "page_size": 10,
    "total_pages": 1
}
```

#### No Mechanics Found (200 OK)
```json
{
    "message": "No mechanic available",
    "mechanics": [],
    "total_count": 0
}
```

#### Error Response (500 Internal Server Error)
```json
{
    "error": "Failed to fetch mechanics",
    "details": "Error message details"
}
```

### Example Requests

#### Get all mechanics
```
GET /api/accounts/discover/mechanics/
```

#### Get mechanics in a specific city
```
GET /api/accounts/discover/mechanics/?city=Tarlac
```

#### Get gold-ranked mechanics
```
GET /api/accounts/discover/mechanics/?ranking=gold
```

#### Get available mechanics with pagination
```
GET /api/accounts/discover/mechanics/?status=available&page=1&page_size=5
```

### UI Integration Notes

Based on the provided image, each mechanic card should display:
- **Profile Photo**: Use `profile_photo` field (show default avatar if null)
- **Name**: Use `full_name` field
- **Ranking Badge**: Use `ranking` field to determine badge color/type
- **Rating**: Use `average_rating` field with star display
- **Jobs Count**: Use `total_jobs` field
- **Location**: Use `location` field
- **Bio/Description**: Use `bio` field for mechanic type description

### Sample Data Creation

To create sample mechanics for testing, run:
```bash
cd backend
python manage.py create_sample_mechanics
```

This will create 4 sample mechanics with different rankings and locations for testing the discovery page.

### Frontend Integration Example

```javascript
// Fetch mechanics for discovery page
const fetchMechanics = async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`/api/accounts/discover/mechanics/?${params}`);
    const data = await response.json();
    
    if (data.mechanics.length === 0) {
        // Show "No mechanic available" message
        displayNoMechanicsMessage();
    } else {
        // Display mechanics in UI
        displayMechanics(data.mechanics);
    }
};

// Display mechanics in card format
const displayMechanics = (mechanics) => {
    const container = document.getElementById('mechanics-container');
    container.innerHTML = mechanics.map(mechanic => `
        <div class="mechanic-card">
            <div class="profile-section">
                <img src="${mechanic.profile_photo || '/default-avatar.png'}" alt="${mechanic.full_name}">
                <div class="ranking-badge ${mechanic.ranking}">${mechanic.ranking}</div>
            </div>
            <h3>${mechanic.full_name}</h3>
            <p class="bio">${mechanic.bio}</p>
            <div class="rating">
                <span class="stars">${generateStars(mechanic.average_rating)}</span>
                <span class="rating-value">${mechanic.average_rating}</span>
            </div>
            <div class="stats">
                <span class="jobs">${mechanic.total_jobs} Jobs</span>
                <span class="location">${mechanic.location}</span>
            </div>
        </div>
    `).join('');
};
```