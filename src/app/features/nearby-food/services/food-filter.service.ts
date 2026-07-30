import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FoodFilterService {
  // Food & dessert keywords that indicate actual Pandan food/treats
  private readonly PANDAN_FOOD_KEYWORDS = [
    'pandan',
    'pandan cake',
    'pandan chiffon',
    'pandan waffle',
    'pandan dessert',
    'pandan kaya',
    'pandan leaf',
    'onde onde',
    'onde-onde',
    'seri muka',
    'kuih',
    'nyonya kuih',
    'kuih lapis',
    'cendol',
    'green cake'
  ];

  // Townships/location names that contain the word "pandan" but are NOT food
  private readonly PANDAN_LOCATION_PHRASES = [
    'pandan indah',
    'pandan perdana',
    'pandan jaya',
    'pandan mewah',
    'taman pandan',
    'bandar pandan',
    'jalan pandan',
    'kampung pandan',
    'lorong pandan',
    'pandan valley',
    'pandan loop'
  ];

  // Non-food establishment categories to exclude
  private readonly NON_FOOD_KEYWORDS = [
    'clinic',
    'klinik',
    'pharmacy',
    'farmasi',
    'hardware',
    'auto',
    'car',
    'salon',
    'hair',
    'laundry',
    'dobi',
    'dental',
    'dentist',
    'vet',
    'veterinary',
    'bank',
    'hotel',
    'optical',
    'optometrist',
    'stationery',
    'printing'
  ];

  constructor() {}

  isPandanRelated(text: string): boolean {
    if (!text) return false;
    let cleanText = text.toLowerCase();

    // Remove location township phrases to avoid matching purely on location names like "Pandan Indah"
    for (const locationPhrase of this.PANDAN_LOCATION_PHRASES) {
      cleanText = cleanText.replaceAll(locationPhrase, '');
    }

    // Check if the remaining text still contains pandan food keywords
    return this.PANDAN_FOOD_KEYWORDS.some(keyword => cleanText.includes(keyword));
  }

  filterPandanPlaces(places: any[]): any[] {
    if (!places) return [];

    return places.filter(place => {
      if (!place || !place.name) return false;
      const lowerName = place.name.toLowerCase();

      // Exclude obvious non-food establishments (clinics, hardware, laundries, etc.)
      const isNonFood = this.NON_FOOD_KEYWORDS.some(k => lowerName.includes(k));
      if (isNonFood) return false;

      // Check if place is genuinely related to Pandan food
      return this.isPandanRelated(place.name);
    });
  }

  removeDuplicates(places: any[]): any[] {
    const uniqueIds = new Set<string>();
    const result = [];

    for (const place of places) {
      const id = place.id || place.place_id;
      if (id && !uniqueIds.has(id)) {
        uniqueIds.add(id);
        result.push(place);
      }
    }

    return result;
  }

  isPlaceOpenNow(openingHoursData: any, now: Date = new Date()): boolean | undefined {
    if (!openingHoursData) return undefined;

    // 1. If live Google Maps isOpen function is available, attempt to use it
    if (typeof openingHoursData.isOpen === 'function') {
      try {
        const liveStatus = openingHoursData.isOpen();
        if (typeof liveStatus === 'boolean') return liveStatus;
      } catch (e) {
        // Fall back to period computation below if live call throws
      }
    }

    // 2. Extract periods array from raw object
    const periods = openingHoursData.periods || openingHoursData.regularOpeningHours?.periods;
    if (!Array.isArray(periods) || periods.length === 0) {
      if (typeof openingHoursData.open_now === 'boolean') {
        return openingHoursData.open_now;
      }
      return undefined;
    }

    // 24 Hours Open Check (1 period with open and no close)
    if (periods.length === 1 && periods[0].open && !periods[0].close) {
      return true;
    }

    const currentDay = now.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (const period of periods) {
      if (!period.open) continue;

      const openDay = period.open.day;
      const openHour = period.open.hour ?? period.open.hours ?? parseInt((period.open.time || '0').slice(0, 2), 10);
      const openMin = period.open.minute ?? period.open.minutes ?? parseInt((period.open.time || '0').slice(2, 4), 10);
      const openTimeMinutes = (openHour || 0) * 60 + (openMin || 0);

      if (!period.close) {
        if (openDay === currentDay) return true;
        continue;
      }

      const closeDay = period.close.day;
      const closeHour = period.close.hour ?? period.close.hours ?? parseInt((period.close.time || '0').slice(0, 2), 10);
      const closeMin = period.close.minute ?? period.close.minutes ?? parseInt((period.close.time || '0').slice(2, 4), 10);
      const closeTimeMinutes = (closeHour || 0) * 60 + (closeMin || 0);

      // Same-day period (e.g. 09:00 to 22:00)
      if (openDay === closeDay) {
        if (currentDay === openDay && currentMinutes >= openTimeMinutes && currentMinutes < closeTimeMinutes) {
          return true;
        }
      } else {
        // Overnight period (e.g. Fri 18:00 to Sat 02:00)
        if (currentDay === openDay && currentMinutes >= openTimeMinutes) {
          return true;
        }
        if (currentDay === closeDay && currentMinutes < closeTimeMinutes) {
          return true;
        }
      }
    }

    return false;
  }
}

