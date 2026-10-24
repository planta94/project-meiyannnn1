import { test, expect } from '@playwright/test';
import { ManualJourneyRecorder } from 'veriscribe';

test.describe('Feature Slice: Discovering Nearby Pandan Food (/)', () => {
  test('[en-US][Role: user] Pandan Food Discovery + Living Manual Recording', async ({ page, context }) => {
    page.on('console', msg => console.log(`[PAGE LOG] ${msg.type()}: ${msg.text()}`));
    page.on('pageerror', err => console.log(`[PAGE ERROR] ${err.message}`));

    // 1. Grant geolocation permissions & setup mock location
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 3.140853, longitude: 101.693207 });

    // Mock image loads to guarantee 100% visual layout health
    await page.route('**/*images.unsplash.com/**', async (route) => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#277a62"/><text x="50%" y="50%" fill="#fff" dominant-baseline="middle" text-anchor="middle" font-size="20">Pandan Specialty</text></svg>`;
      await route.fulfill({
        status: 200,
        contentType: 'image/svg+xml',
        body: svg
      });
    });

    // 2. Intercept Google Maps script to provide deterministic mock behavior
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
                this.setCenter = function() {};
                this.setZoom = function() {};
              },
              Marker: function() {
                this.setMap = function() {};
                this.setPosition = function() {};
                this.addListener = function() {};
              },
              InfoWindow: function() {
                this.open = function() {};
                this.close = function() {};
                this.setContent = function() {};
              },
              Circle: function() {
                this.setMap = function() {};
                this.setCenter = function() {};
                this.setRadius = function() {};
                this.getBounds = function() {
                  return new window.google.maps.LatLngBounds();
                };
              },
              LatLngBounds: function() {
                this.extend = function() {};
              },
              SymbolPath: {
                CIRCLE: 0
              },
              LatLng: function(lat, lng) {
                this.lat = function() { return lat; };
                this.lng = function() { return lng; };
              },
              geometry: {
                spherical: {
                  computeDistanceBetween: function() { return 350; }
                }
              },
              marker: {
                AdvancedMarkerElement: function(opts) {
                  this.opts = opts;
                  this.listeners = {};
                  this.addListener = function(event, callback) {
                    this.listeners[event] = callback;
                  };
                  this.setMap = function() {};
                  if (opts && opts.content) {
                    opts.content.setAttribute('data-testid', 'pandan-map-pin');
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
              places: {
                Place: {
                  searchByText: async function() {
                    return {
                      places: [
                        {
                          id: 'pandan-spot-1',
                          displayName: 'Ah Yan Pandan Chiffon House',
                          rating: 4.8,
                          userRatingCount: 420,
                          formattedAddress: '18 Jalan Pandan Indah 4/1, Kuala Lumpur',
                          location: {
                            lat: () => 3.1412,
                            lng: () => 101.6945
                          },
                          photos: [
                            'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="%23277a62"/></svg>'
                          ],
                          regularOpeningHours: {
                            isOpen: () => true
                          }
                        },
                        {
                          id: 'pandan-spot-2',
                          displayName: 'Authentic Nyonya Kuih & Onde-Onde',
                          rating: 4.6,
                          userRatingCount: 215,
                          formattedAddress: '88 Heritage Food Street, Kuala Lumpur',
                          location: {
                            lat: () => 3.1425,
                            lng: () => 101.6920
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
              }
            }
          };
        `
      });
    });

    // 3. Clear storage and pre-seed authentication token & deterministic GPS location
    await page.addInitScript(() => {
      localStorage.clear();
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

    // 4. Initialize VeriScribe Living Manual Recorder
    const manual = new ManualJourneyRecorder(page, {
      chapterId: 'nearby-food',
      featureTitle: 'Discovering Nearby Pandan Food & Bakeries',
      summary: 'Learn how to explore nearby Pandan chiffon cakes, kuih, and local bakeries with real-time distance and interactive map.',
      role: 'user',
      locale: 'en-US',
      routePath: '/',
      preconditions: [
        'Browser location permission is granted.',
        'Authenticated using preset access credentials.'
      ],
      captureResponsiveViewports: true
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Step 1: Open Discovery Dashboard & Map View
    const headerTitle = page.locator('header.header');
    await expect(headerTitle).toBeVisible();
    await manual.recordStep({
      title: 'Open Pandan Discovery Dashboard',
      userInstruction: 'Launch the application in your browser. The system will detect your location and initialize the interactive food map.',
      expectedOutcome: 'The hero header, 3D leaf backdrop, and interactive map container are displayed.',
      target: headerTitle,
      notes: 'Ensure your device location services are turned on for accurate geodesic distance calculations.',
      action: async () => {
        await expect(headerTitle).toContainText('斑兰Yan');
      }
    });

    // Step 2: Locate Pandan Food Markers on Interactive Map
    const mapPin = page.locator('.pandan-map-badge').first();
    await expect(mapPin).toBeVisible({ timeout: 15000 });
    await manual.recordStep({
      title: 'Explore Nearby Pandan Pins on Map',
      userInstruction: 'Scan the interactive Google Map to view pins indicating verified Pandan culinary locations within walking distance.',
      expectedOutcome: 'Map markers display rating badges (e.g. 4.8★) positioned at exact geodesic coordinates.',
      target: mapPin,
      notes: 'Each marker is filtered to exclude non-food businesses in townships named Pandan.',
      action: async () => {
        await expect(mapPin).toContainText('4.8★');
      }
    });

    // Step 3: Click Marker to Open Detailed Food Card
    await manual.recordStep({
      title: 'Select a Spot for Detailed Information',
      userInstruction: 'Click any green Pandan pin on the map to bring up the establishment card overlay.',
      expectedOutcome: 'A floating card displays the food spot name, star rating, address, opening hours, and distance.',
      target: mapPin,
      action: async () => {
        await mapPin.click();
      }
    });

    // Step 4: Review Food Card & Details
    const foodCard = page.locator('app-food-card');
    await expect(foodCard).toBeVisible({ timeout: 5000 });
    await manual.recordStep({
      title: 'Review Spot Details & Opening Hours',
      userInstruction: 'Inspect the specialty highlights, rating badge, address, and live open status.',
      expectedOutcome: 'Detailed info confirms business name, photo preview, and open status.',
      target: foodCard,
      notes: 'The badge tags top-tier chiffon cakes, authentic kuih, and waffles.',
      action: async () => {
        await expect(foodCard).toContainText('Ah Yan Pandan Chiffon House');
      }
    });

    // Step 5: Adjust Radius & Rating Filters
    const filterPanel = page.locator('app-filter-panel');
    await expect(filterPanel).toBeVisible();
    await manual.recordStep({
      title: 'Filter by Distance Radius and Rating',
      userInstruction: 'Use the filter panel to select maximum walking distance (e.g., 1km, 3km, 5km) or filter by minimum rating.',
      expectedOutcome: 'The map dynamically adjusts pins matching the updated filter preferences.',
      target: filterPanel,
      action: async () => {
        await expect(filterPanel).toBeVisible();
      }
    });

    // Step 6: Record Troubleshooting scenario
    await manual.recordTroubleshootingScenario({
      scenario: 'No Pandan Spots Visible within 1km',
      userMessage: 'No authentic Pandan spots found nearby',
      resolution: 'Expand search radius to 3km or 5km using the filter panel, or click "Try Again" after granting location permission.',
    });

    // Finalize Living Manual chapter
    const manualJson = await manual.finalize();
    expect(manualJson).toContain('manual-steps.json');
  });
});
