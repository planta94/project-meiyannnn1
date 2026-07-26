import { test, expect } from '@playwright/test';

test.describe('Pandan Food App', () => {
  test.beforeEach(async ({ page, context }) => {
    // Grant location permissions
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 3.140853, longitude: 101.693207 });

    // Mock Google Maps API script load to avoid actual calls during basic load tests
    // We would normally fully intercept nearbySearch and getDetails
    await page.route('**/*maps.googleapis.com/maps/api/js*', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/javascript',
            body: `
                window.google = {
                    maps: {
                        Map: function() {
                            this.panTo = function() {};
                            this.fitBounds = function() {};
                        },
                        Marker: function() {
                            this.setMap = function() {};
                            this.setPosition = function() {};
                            this.addListener = function() {};
                        },
                        LatLng: function(lat, lng) {
                            this.lat = function() { return lat; };
                            this.lng = function() { return lng; };
                        },
                        LatLngBounds: function() {
                            this.extend = function() {};
                        },
                        SymbolPath: { CIRCLE: 0 },
                        places: {
                            PlacesService: function() {
                                this.nearbySearch = function(req, cb) {
                                    cb([
                                        {
                                            place_id: '1',
                                            name: 'Pandan Chiffon Cafe',
                                            rating: 4.5,
                                            user_ratings_total: 100,
                                            vicinity: '123 Test St',
                                            geometry: {
                                                location: new window.google.maps.LatLng(3.141, 101.694)
                                            },
                                            opening_hours: { isOpen: () => true }
                                        }
                                    ], 'OK');
                                };
                            },
                            PlacesServiceStatus: { OK: 'OK', ZERO_RESULTS: 'ZERO_RESULTS' }
                        },
                        geometry: {
                            spherical: {
                                computeDistanceBetween: function() { return 500; }
                            }
                        }
                    }
                };
            `
        });
    });

    await page.goto('/');
  });

  test('Application loads successfully and displays map and mock data', async ({ page }) => {
    // Check header
    await expect(page.locator('mat-toolbar')).toContainText('Pandan Nearby Food');

    // Check that a mock food card appears
    await expect(page.locator('app-food-card')).toBeVisible();
    await expect(page.locator('mat-card-title')).toContainText('Pandan Chiffon Cafe');

    // Check distance text is rendered
    await expect(page.locator('mat-card-subtitle')).toContainText('500m away');
  });

  test('Empty state shown when no places found', async ({ page, context }) => {
     // Override the route to return zero results
     await page.route('**/*maps.googleapis.com/maps/api/js*', async (route) => {
         await route.fulfill({
            status: 200,
            contentType: 'application/javascript',
            body: `
                window.google = {
                    maps: {
                        Map: function() {},
                        LatLng: function() {},
                        places: {
                            PlacesService: function() {
                                this.nearbySearch = function(req, cb) {
                                    cb([], 'ZERO_RESULTS');
                                };
                            },
                            PlacesServiceStatus: { OK: 'OK', ZERO_RESULTS: 'ZERO_RESULTS' }
                        }
                    }
                };
            `
        });
     });

     await page.goto('/');

     // Wait for empty state component
     await expect(page.locator('app-empty-state')).toBeVisible();
     await expect(page.locator('.empty-container p').first()).toContainText('No pandan food found nearby');
  });
});
