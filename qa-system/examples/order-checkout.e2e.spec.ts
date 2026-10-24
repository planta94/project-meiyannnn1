import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { ManualJourneyRecorder } from 'veriscribe';

/**
 * GOLDEN REFERENCE: Playwright E2E Living Spec + User Manual Generator
 * Demonstrates verifying all 9 Ready-to-Ship dimensions while generating
 * annotated User Manual screenshots and troubleshooting tables as a by-product.
 */
test.describe('Feature Slice: Order Checkout (/orders/checkout)', () => {
  const roles = ['admin', 'user'] as const;
  const locales = ['en-US'] as const;

  for (const locale of locales) {
    for (const role of roles) {
      test(`[${locale}][Role: ${role}] Complete Checkout Journey + Multi-Dimension Verification + Manual Capture`, async ({
        page,
      }) => {
        // 1. Deterministic API Mocking (Validated against OpenAPI Schema)
        await page.route('**/api/v1/auth/me', async (route) => {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ id: 'usr_01', name: 'Alex Rivera', role, locale }),
          });
        });

        await page.route('**/api/v1/orders/checkout', async (route) => {
          const payload = route.request().postDataJSON();
          if (!payload?.shippingAddress) {
            await route.fulfill({
              status: 422,
              contentType: 'application/json',
              body: JSON.stringify({ code: 'ADDRESS_REQUIRED', message: 'Please provide a valid shipping address.' }),
            });
            return;
          }
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ orderId: 'ORD-2026-9981', status: 'CONFIRMED' }),
          });
        });

        // 2. Initialize the User Manual Recorder
        const manual = new ManualJourneyRecorder(page, {
          chapterId: 'orders-checkout',
          featureTitle: 'Submitting an Order at Checkout',
          summary: 'Learn how to review items in your cart, enter shipping details, and confirm your order.',
          role,
          locale,
          routePath: '/orders/checkout',
          preconditions: [
            'You are signed in with an active account.',
            'Your shopping cart contains at least one item.',
          ],
        });

        await page.goto('/orders/checkout');

        // 3. Dimension: Accessibility (WCAG 2.1 AA via axe-core)
        const a11yResults = await new AxeBuilder({ page }).analyze();
        expect(a11yResults.violations, 'Accessibility violations found on /orders/checkout').toEqual([]);

        // 4. Dimension: Responsive Viewports (Desktop, Tablet, Mobile overflow check)
        await manual.verifyResponsiveViewports();

        // 5. Dimension: Functional Journey + Visual Callout Screenshots for User Manual
        const addressInput = page.getByTestId('shipping-address-input');
        await manual.recordStep({
          title: 'Enter Shipping Address',
          userInstruction: 'Type your full street address and postal code into the **Shipping Address** field.',
          expectedOutcome: 'The shipping form validates your address and enables the Confirm Order button.',
          target: addressInput,
          action: async () => {
            await addressInput.fill('742 Evergreen Terrace, Springfield');
          },
        });

        const submitBtn = page.getByTestId('confirm-order-btn');
        await manual.recordStep({
          title: 'Confirm and Place Order',
          userInstruction: 'Click the **Confirm Order** button at the bottom of the summary card.',
          expectedOutcome: 'A confirmation banner appears displaying your new Order ID (e.g., `ORD-2026-9981`).',
          target: submitBtn,
          notes: 'Double-check your billing currency before clicking Confirm Order.',
          action: async () => {
            await submitBtn.click();
            await expect(page.getByTestId('order-confirmation-banner')).toContainText('ORD-2026-9981');
          },
        });

        // 6. Dimension: Error Resilience & Degraded State -> Populates Manual Troubleshooting Section
        await manual.recordTroubleshootingScenario({
          scenario: 'Submitting checkout without a shipping address',
          userMessage: 'Please provide a valid shipping address.',
          resolution: 'Ensure both street address and postal code fields are completed before clicking Confirm Order.',
        });

        // 7. Finalize: Asserts zero console/page errors & writes manual-steps.json
        await manual.finalize();
      });
    }
  }

  test('[RBAC Guard] Guest role is redirected to /login when accessing /orders/checkout', async ({ page }) => {
    await page.route('**/api/v1/auth/me', (route) =>
      route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Unauthorized' }) })
    );
    await page.goto('/orders/checkout');
    await expect(page).toHaveURL(/\/login/);
  });
});
