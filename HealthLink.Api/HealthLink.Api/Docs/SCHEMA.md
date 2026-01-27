# HealthLink Database Schema – Design Notes

This document describes **intentional business rules and invariants**
that are enforced partially by the database schema and partially by
application logic.

## General Principles

- All timestamps are stored in UTC.
- `CreatedAt` is set once and never modified.
- `UpdatedAt` is automatically updated on every modification via EF Core.
- Hard deletes are used intentionally (no soft-delete policy).

---

## User, Client, Expert

- `User ↔ Client` is one-to-one.
- `User ↔ Expert` is one-to-one.
- A user **cannot** be both Client and Expert at the same time (enforced in application logic).
- User deletion is restricted if related Client/Expert exists.

---

## Appointments

- One Appointment belongs to exactly one Client and one Expert.
- Appointment time ranges must not overlap per Expert (enforced in application logic).
- Appointment status lifecycle:
  - Scheduled
  - Completed
  - CancelledByClient
  - CancelledByExpert
  - NoShow

---

## Reviews

- One Review per Appointment (unique constraint).
- Reviews require admin approval before affecting Expert rating.
- Review statuses:
  - PendingApproval
  - Approved
  - Rejected

---

## Conversations & Messages

- One Conversation per (ClientId, ExpertId) pair.
- Messages belong to exactly one Conversation.
- `IsRead` and `ReadAt` must be consistent (enforced in application logic).

---

## Packages & Payments

- ClientPackage is created only after successful Payment.
- Expired packages must not be used for new Appointments (application logic).
- DiscountCode usage limits are enforced transactionally in application logic.

---

## Schedules

- ExpertScheduleTemplate defines weekly availability (DayOfWeek: 0–6).
- ExpertScheduleException overrides template for specific dates.
- Exceptions always take precedence over templates.

---

## Seed Data Policy

Seed data is limited to **system-invariant data**:
- SystemSettings
- Specializations
- Minimal ServicePackages

Seed data is applied via EF Core migrations and must not be modified casually.
