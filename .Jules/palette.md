## 2025-10-26 - Modal Focus Management
**Learning:** In Single Page Applications (SPAs) where modals are dynamically created and destroyed, simply showing/hiding them is not enough for accessibility. Screen reader users and keyboard navigators can get lost if focus isn't managed.
**Action:** When creating a reusable Modal system, always implement a mechanism to:
1. Store the element that had focus *before* the modal opened (`document.activeElement`).
2. Focus the first interactive element (or the container itself) *immediately* after the modal opens.
3. Restore focus to the stored element when the modal closes.
This "Focus Restoration" pattern significantly improves the navigation flow and context retention for users relying on assistive technology.
