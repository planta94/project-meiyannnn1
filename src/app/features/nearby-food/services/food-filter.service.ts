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
}
