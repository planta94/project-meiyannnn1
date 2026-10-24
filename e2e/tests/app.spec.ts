import { test, expect } from '@playwright/test';

test.describe('Pandan Food App', () => {
  test.beforeEach(async ({ page, context }) => {
    // Grant location permissions
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 3.140853, longitude: 101.693207 });

    // Set auth token so app-login-card does not block map initialization
    await page.addInitScript(() => {
      localStorage.setItem('pandan_auth_expiry', (Date.now() + 864000000).toString());

      navigator.geolocation.getCurrentPosition = (success) => {
        success({
          coords: {
            latitude: 3.140853,
            longitude: 101.693207,
            accuracy: 10,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        });
      };
    });

    // Mock Google Maps API script load to avoid actual calls during basic load tests
    // We would normally fully intercept nearbySearch and getDetails
    await page.route('**/*maps.googleapis.com/maps/api/js*', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/javascript',
            body: `
                window.google = {
                    maps: {
                        Map: function(container) {
                            this.container = container;
                            this.panTo = function() {};
                            this.fitBounds = function() {};
                        },
                        Marker: function() {
                            this.setMap = function() {};
                            this.setPosition = function() {};
                            this.addListener = function() {};
                        },
                        Circle: function() {
                            this.setMap = function() {};
                            this.setCenter = function() {};
                            this.setRadius = function() {};
                            this.getBounds = function() {
                                return new window.google.maps.LatLngBounds();
                            };
                        },
                        marker: {
                            AdvancedMarkerElement: function(opts) {
                                this.opts = opts;
                                this.listeners = {};
                                this.addListener = function(evt, cb) {
                                    this.listeners[evt] = cb;
                                };
                                this.setMap = function() {};
                                if (opts && opts.content) {
                                    opts.content.addEventListener('click', () => {
                                        if (this.listeners['gmp-click']) {
                                            this.listeners['gmp-click']();
                                        }
                                    });
                                    if (opts.map && opts.map.container) {
                                        opts.map.container.appendChild(opts.content);
                                    }
                                }
                            }
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
                            Place: {
                                searchByText: async function() {
                                    return {
                                        places: [
                                            {
                                                id: '1',
                                                displayName: 'Pandan Chiffon Cafe',
                                                rating: 4.5,
                                                userRatingCount: 100,
                                                formattedAddress: '123 Test St',
                                                location: {
                                                    lat: () => 3.141,
                                                    lng: () => 101.694
                                                },
                                                photos: [
                                                    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="%23277a62"/></svg>'
                                                ],
                                                regularOpeningHours: {
                                                    isOpen: () => true
                                                }
                                            }
                                        ]
                                    };
                                }
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
    await expect(page.locator('header.header')).toContainText('斑兰Yan');

    // Click map pin to open food card overlay
    const pin = page.locator('.pandan-map-badge').first();
    await expect(pin).toBeVisible({ timeout: 10000 });
    await pin.click();

    // Check that a mock food card appears
    await expect(page.locator('app-food-card')).toBeVisible();
    await expect(page.locator('.place-name')).toContainText('Pandan Chiffon Cafe');

    // Check distance text is rendered
    await expect(page.locator('.distance-chip')).toContainText('500m');
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
     await expect(page.locator('app-empty-state')).toContainText('No Pandan Treats Found');
  });
});
