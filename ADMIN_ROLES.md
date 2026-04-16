# Admin Roles

This document records the current admin-account structure, role definitions, and access model for the GospelAGC admin system.

## Admin Account Model

- The first account created through `/admin/setup` becomes `super_admin`.
- After setup, a `super_admin` can create more admin users from the admin dashboard.
- Multiple admin users can exist at the same time.
- Each admin user has a role, and that role determines what they can access in the dashboard and what actions they can perform.
- Environment-based admin credentials, if configured, behave like a `super_admin`.

## Current Roles

### `super_admin`

Purpose:
Full platform owner and admin-team manager.

Can do:
- Access all admin dashboard tabs
- Create admin users
- Edit admin users
- Change admin roles
- Delete admin users, except their own account
- Manage contestants
- Manage stages
- Manage payments
- View overview analytics

Typical use:
- Founder
- Technical owner
- Head administrator

### `contestant_manager`

Purpose:
Owns contestant onboarding and contestant lifecycle actions.

Can do:
- Access `Overview`
- Access `Contestants`
- Create contestants
- Edit contestants
- Approve contestants
- Reject contestants
- Eliminate contestants
- Restore contestants

Cannot do:
- Manage admin users
- Manage stages
- Access payment management in the dashboard

Typical use:
- Talent coordinator
- Screening/admin operations staff

### `stage_manager`

Purpose:
Owns stage flow and progression of the competition.

Can do:
- Access `Overview`
- Access `Stages`
- Create stages
- Start stages
- End stages
- Run auto-eliminate

Cannot do:
- Manage admin users
- Manage contestants
- Access payment management in the dashboard

Typical use:
- Show coordinator
- Competition flow manager

### `finance_admin`

Purpose:
Owns payment monitoring and financial operations inside admin.

Can do:
- Access `Overview`
- Access `Payments`
- View payment logs
- Verify pending payments
- Export payment CSV

Cannot do:
- Manage admin users
- Manage contestants
- Manage stages

Typical use:
- Finance officer
- Payment/reconciliation staff

### `viewer`

Purpose:
Read-only admin access for visibility without operational control.

Can do:
- Access `Overview`

Cannot do:
- Manage admin users
- Manage contestants
- Manage stages
- Access payment management in the dashboard

Typical use:
- Auditor
- Leadership observer
- Read-only stakeholder

## Dashboard Tab Access

The current dashboard tab visibility is:

| Role | Overview | Contestants | Stages | Payments | Admins |
| --- | --- | --- | --- | --- | --- |
| `super_admin` | Yes | Yes | Yes | Yes | Yes |
| `contestant_manager` | Yes | Yes | No | No | No |
| `stage_manager` | Yes | No | Yes | No | No |
| `finance_admin` | Yes | No | No | Yes | No |
| `viewer` | Yes | No | No | No | No |

## Role Behavior Summary

### Super Admin Flow

1. First account is created through `/admin/setup`.
2. That account is assigned `super_admin`.
3. `super_admin` signs in and accesses the full admin dashboard.
4. `super_admin` can open the `Admins` tab and create more admin users.
5. `super_admin` can assign roles such as `contestant_manager`, `stage_manager`, `finance_admin`, or `viewer`.

### Team Admin Flow

1. A `super_admin` creates a new admin account.
2. The new admin signs in with their own email and password.
3. The system shows only the tabs allowed for that role.
4. The admin performs only the actions allowed by that role.

## Backend Enforcement

The current implementation enforces the following on the backend:

- `manage_admins`
  - `super_admin` only
  - Used for creating, editing, and deleting admin users

- `manage_contestants`
  - `super_admin`
  - `contestant_manager`
  - Used for contestant mutations

- `manage_stages`
  - `super_admin`
  - `stage_manager`
  - Used for stage mutations

The current implementation enforces the following in the dashboard UI:

- `manage_payments`
  - `super_admin`
  - `finance_admin`
  - Used for showing the `Payments` tab and payment actions

## Current Note

At the moment, payment and vote GraphQL queries still allow any signed-in admin at the resolver level, while the dashboard UI only exposes payment tools to `finance_admin` and `super_admin`.

That means the intended product behavior is already reflected in the admin UI, but the backend payment query restriction can still be tightened further if needed.

## Recommended Usage

- Keep the number of `super_admin` accounts small.
- Use `contestant_manager` for contestant operations staff.
- Use `stage_manager` for live competition flow staff.
- Use `finance_admin` for payment and reconciliation staff.
- Use `viewer` for read-only oversight.

## Future Improvements

Recommended next enhancements:

- Restrict payment and vote GraphQL queries to `finance_admin` and `super_admin`
- Add profile settings and password-change flow for admins
- Add audit logging for admin actions
- Add account disable/suspend support
