## Packages
zustand | Global state management for the shopping cart
lucide-react | Icons (should be present, but ensuring it's available for the UI)

## Notes
- Tailwind config should map `--font-display` and `--font-sans` correctly.
- Ensure the `@shared/routes` and `@shared/schema` are accessible for importing API contracts and types.
- The backend stores `price` as `numeric`, which may serialize as strings. Frontend handles conversions.
