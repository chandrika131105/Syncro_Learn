# Project Constraints & Architecture Rules

## 1. Security & Data Visibility
- **Public Feeds**: All public-facing course lists (e.g., `GET /api/courses`) MUST strictly filter by `isPublished = true`.
- **Authorization**: Functional endpoints (Create, Update, Delete) must be protected by Role-Based Access Control (RBAC).

## 2. Persistence & State
- **Single Source of Truth**: User preferences (Wishlist, Progress) must be persisted to the Backend SQL Database.
- **Frontend State**: Use optimistic UI updates for responsiveness, but always sync with the backend.

## 3. Error Handling
- **Sanitization**: Never return raw Java Exception stack traces or messages to the client.
- **Protocol**: Use the `com.studysync.studysyncbackend.exception.GlobalExceptionHandler` to catch exceptions and map them to the `ApiError` DTO.
- **Format**: Errors must return JSON: `{ "status": 4xx/5xx, "message": "User friendly message" }`.

## 4. Design Guidelines
- **Form Follows Function**: Functionality and Security take precedence over aesthetics.
- **Visuals**: Use Tailwind CSS for standard layouts. "Premium" effects should be applied via CSS classes, not inline styles.

## 5. Testing & Tooling
- **Windows Environment**: Always use `Invoke-RestMethod` for API testing on Windows. Avoid `curl` due to JSON quoting issues in PowerShell.
- **Verification**: Never assume a fix in one file propagates. Use `grep_search` to find all usages of a feature (e.g., "Wishlist", "Heart") before marking a task complete.

## 6. Refactoring Protocol
- **DRY Principle**: If logic (like Wishlist toggling) appears in >=2 places, extract it to a Custom Hook (e.g., `useWishlist`) or Service.
- **Scope Check**: Before editing a component, search for where else similar business logic might live (Pages vs Components).
