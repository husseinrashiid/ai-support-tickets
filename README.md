# AI Support Tickets

## Test accounts

Support agent:
- Email: agent@example.com
- Password: Agent123!

Customers can create their own accounts through `/register`.

## Creating additional agent accounts

Public registration always creates a `customer` account — there is no way to self-register as an agent. To provision another agent account:

```
npm run create-agent -- <email> <password>
```

This hashes the password with bcrypt and inserts (or updates) a user with `role: "agent"` directly in the database.
