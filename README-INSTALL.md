# ScanX Remaining Authentication Frontend Files

Copy every folder from this package into the frontend project root.

Project root:

```text
C:\Latitude_Projects\ScanX\Command_Center\scanx_command_center_fe\scanx-command-center-fe
```

The package includes:

- Forgot-password hook, form, and page
- Reset-password hook, form, and page
- Change-password hook, form, and page
- Protected route component
- Auth, role, and permission hooks
- Permission utilities
- Unauthorized page
- Dashboard and role-specific layouts

After copying, run:

```cmd
rmdir /s /q .next
npm run build
npm run dev
```

Backend assumptions to verify:

- POST /auth/forgot-password accepts `{ "email": "..." }`
- POST /auth/reset-password accepts `{ "token": "...", "new_password": "..." }`
- POST /auth/change-password accepts `{ "current_password": "...", "new_password": "..." }`
- Reset links use `/reset-password?token=<token>`
- `/auth/me` returns `role`, `permissions`, `status`, `is_active`, and `must_change_password`

The frontend route guard improves navigation and display safety. Backend authorization remains mandatory.
