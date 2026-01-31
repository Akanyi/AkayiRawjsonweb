from playwright.sync_api import Page, expect, sync_playwright
import time

def verify_toast(page: Page):
    # 1. Arrange: Go to the app.
    page.goto("http://localhost:8080")

    # Verify ARIA labels
    expect(page.locator("#menu-button")).to_have_attribute("aria-label", "Menu")
    expect(page.locator("#richTextEditor")).to_have_attribute("aria-label", "Rich Text Editor")

    # 2. Act: Click the "Copy" button.
    # The button has id "copy-json-btn" and text "复制"
    copy_btn = page.locator("#copy-json-btn")
    copy_btn.click()

    # 3. Assert: Wait for toast to appear.
    # It should say "没有内容可复制!" (No content to copy) because editor is empty.
    # The toast is in #toast-container
    toast = page.get_by_text("没有内容可复制!")
    expect(toast).to_be_visible()

    # 4. Screenshot
    # Take screenshot of the whole page to see the toast position
    page.screenshot(path="verification/toast_verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_toast(page)
            print("Verification script ran successfully.")
        except Exception as e:
            print(f"Verification failed: {e}")
        finally:
            browser.close()
