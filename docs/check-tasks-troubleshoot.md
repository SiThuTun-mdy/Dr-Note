# /check-tasks Troubleshooting

**Date:** 2026-07-11
**Issue:** User confused about which GitHub account owns the issues when running `/check-tasks`.

---

## Root Cause

The project has a **split-repo setup**:

| Repo | Owner | Purpose |
|------|-------|---------|
| `SiThuTun-mdy/Dr-Note` | Developer | Source code |
| `SiThuTun-mdy/Dr-Note` | PM | Issue tracker |

Issues are **assigned to the developer** (`SiThuTun-mdy`) in the **repo** (`SiThuTun-mdy/Dr-Note`).

---

## Why It Seemed Wrong

When running `gh issue list --assignee @me`, it returns issues assigned to the authenticated user (`ChanOoDev`) across repos. The user expected issues to be "in" the PM's account, not "assigned to" their account in the PM's repo.

---

## Resolution

1. Confirm `gh auth status` shows correct account
2. Explain: Issues in PM's repo, but assigned to developer's account
3. Use `--repo SiThuTun-mdy/Dr-Note --assignee @me` explicitly

---

## How to Apply

When running `/check-tasks`:
1. Always check BOTH repos (code repo first, then issue tracker)
2. Explain the split-repo setup if user is confused
3. Clarify: "assigned to you in PM's repo" vs "owned by PM's account"

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `gh issue list --repo SiThuTun-mdy/Dr-Note --assignee @me` | Check code repo (usually empty) |
| `gh issue list --repo SiThuTun-mdy/Dr-Note --assignee @me` | Check issue tracker (main tasks) |
| `gh auth status` | Verify which GitHub account is active |
