# Quotation System API Guide

This guide documents the quotation system endpoints for the mechanic/provider side implementation.

## Overview

The quotation system allows providers (mechanics/shops) to create itemized quotes for custom requests, and clients to accept or reject those quotes.

## Workflow

1. **Client creates custom request** → Status: `pending`
2. **Provider creates quotation** → Status: `qouted` (quoted)
3. **Client reviews quotation** → Can accept or reject
4. **If accepted** → Creates booking with status `active`, total from quoted items
5. **If rejected** → Changes status to `rejected`

---

## API Endpoints

### 1. Create Quotation (Provider Side)

**Endpoint:** `POST /api/requests/<request_id>/create-quote/`

**Description:** Provider creates itemized quote for a custom request

**Request Body:**
```json
{
  "items": [
    {
      "item": "Oil Change",
      "price": 500.00
    },
    {
      "item": "Brake Pad Replacement",
      "price": 1500.00
    },
    {
      "item": "Engine Diagnostic",
      "price": 800.00
    }
  ],
  "providers_note": "All parts are OEM. Labor included in price."
}
```

**Success Response (201):**
```json
{
  "message": "Quote created successfully",
  "request_id": 38,
  "items": [
    {
      "custom_request_item_id": 1,
      "item": "Oil Change",
      "price": "500.00"
    },
    {
      "custom_request_item_id": 2,
      "item": "Brake Pad Replacement",
      "price": "1500.00"
    },
    {
      "custom_request_item_id": 3,
      "item": "Engine Diagnostic",
      "price": "800.00"
    }
  ],
  "total": "2800.00"
}
```

**Business Logic:**
- Only works for custom requests
- Request must be in `pending` status
- Deletes any existing quoted items before creating new ones
- Updates request status to `qouted`
- Sends notification to client with total amount
- Provider's note is optional and saved to `CustomRequest.providers_note`

**Error Responses:**
- 400: Request not in pending status
- 400: Not a custom request
- 400: No items provided
- 404: Request not found

---

### 2. Accept Quotation (Client Side - Already Implemented)

**Endpoint:** `POST /api/requests/<request_id>/accept-quotation/`

**Description:** Client accepts the quotation

**Request Body:** None required

**Success Response (200):**
```json
{
  "message": "Quotation accepted successfully",
  "booking": {
    "booking_id": 24,
    "status": "active",
    "amount_fee": "2800.00",
    ...
  },
  "total_amount": "2800.00"
}
```

**Business Logic:**
- Calculates total from all quoted items
- Changes request status from `qouted` to `accepted`
- Creates new Booking with total amount
- Sends notifications to both client and provider

---

### 3. Reject Quotation (Client Side - Already Implemented)

**Endpoint:** `POST /api/requests/<request_id>/reject-quotation/`

**Description:** Client rejects the quotation

**Request Body:**
```json
{
  "reason": "Price too high" // Optional
}
```

**Success Response (200):**
```json
{
  "message": "Quotation rejected successfully",
  "request_id": 38,
  "status": "rejected"
}
```

**Business Logic:**
- Changes request status from `qouted` to `rejected`
- Sends notification to provider with rejection reason
- Request can no longer be processed

---

## Database Models

### QuotedRequestItem
```python
class QuotedRequestItem(models.Model):
    custom_request_item_id = AutoField(primary_key=True)
    custom_request = ForeignKey('CustomRequest')
    item = CharField(max_length=255)
    price = DecimalField(max_digits=12, decimal_places=2)
```

### CustomRequest
```python
class CustomRequest(models.Model):
    request = OneToOneField('Request')
    description = TextField()
    concern_picture = TextField()
    providers_note = TextField()  # Provider's notes about the quote
    estimated_budget = DecimalField()  # Client's initial budget estimate
```

---

## Frontend Integration Examples

### For Mechanic Side - Create Quotation

```typescript
const createQuotation = async (requestId: number, items: Array<{item: string, price: number}>) => {
  try {
    const response = await fetch(`http://localhost:8000/api/requests/${requestId}/create-quote/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: items,
        providers_note: "All parts are genuine. Warranty included."
      }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('Quote created:', data);
      // Show success message
      // Navigate back to job list or request details
    } else {
      console.error('Error:', data.error);
      // Show error message
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};

// Example usage:
const quoteItems = [
  { item: "Oil Change", price: 500 },
  { item: "Oil Filter", price: 150 },
  { item: "Labor", price: 300 }
];

createQuotation(38, quoteItems);
```

### UI Component Example

```tsx
// QuoteItemForm.tsx
const [quoteItems, setQuoteItems] = useState([
  { item: '', price: 0 }
]);

const addItem = () => {
  setQuoteItems([...quoteItems, { item: '', price: 0 }]);
};

const removeItem = (index: number) => {
  setQuoteItems(quoteItems.filter((_, i) => i !== index));
};

const updateItem = (index: number, field: 'item' | 'price', value: any) => {
  const updated = [...quoteItems];
  updated[index][field] = value;
  setQuoteItems(updated);
};

const total = quoteItems.reduce((sum, item) => sum + Number(item.price), 0);

return (
  <div>
    {quoteItems.map((item, index) => (
      <div key={index}>
        <input
          type="text"
          placeholder="Item description"
          value={item.item}
          onChange={(e) => updateItem(index, 'item', e.target.value)}
        />
        <input
          type="number"
          placeholder="Price"
          value={item.price}
          onChange={(e) => updateItem(index, 'price', e.target.value)}
        />
        <button onClick={() => removeItem(index)}>Remove</button>
      </div>
    ))}
    <button onClick={addItem}>Add Item</button>
    <div>Total: ₱{total.toFixed(2)}</div>
    <button onClick={() => createQuotation(requestId, quoteItems)}>
      Submit Quote
    </button>
  </div>
);
```

---

## Notifications

The system automatically sends notifications for:

1. **Quote Created** → Client receives: "Provider has sent you a quotation for ₱X"
2. **Quote Accepted** → Provider receives: "Client accepted your quotation for ₱X"
3. **Quote Rejected** → Provider receives: "Client rejected your quotation" (with reason if provided)

---

## Testing Tips

1. **Create a custom request** first from client side
2. **Use the create-quote endpoint** to add quoted items
3. **Check the request status** changed to 'qouted'
4. **View in client quotation tab** to see the itemized list
5. **Test accept/reject** functionality

---

## Common Issues

### Issue: "Request must be in pending status"
**Solution:** Request was already quoted or accepted. Only pending requests can be quoted.

### Issue: "Only custom requests can be quoted"
**Solution:** Direct requests use service prices, emergency requests are different. Only custom requests use quotations.

### Issue: "No quoted items found"
**Solution:** Provider must create quoted items before client can accept.

---

## Next Steps for Mechanic Side

1. Create a "Review Requests" page showing pending custom requests
2. Add "Create Quote" button that opens a form
3. Implement the quote item form with add/remove functionality
4. Call the `/create-quote/` endpoint when submitting
5. Show success message and update request status in UI
6. Add ability to view/edit existing quotes (requires additional endpoint if needed)

---

## Status Reference

- `pending` → Request created, waiting for provider action
- `qouted` → Provider sent quotation, waiting for client decision
- `accepted` → Client accepted, booking created
- `rejected` → Client/provider rejected

---

**Client Side:** ✅ Fully implemented
**Provider Side:** 🔧 Ready for your team leader to implement

All backend endpoints are ready and tested. The frontend just needs to call these endpoints.
