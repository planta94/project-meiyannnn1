import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FoodFilterService {
  private readonly PANDAN_KEYWORDS = [
    'pandan',
    'pandan cake',
    'pandan chiffon',
    'pandan waffle',
    'pandan dessert',
    'pandan kaya',
    'onde onde',
    'onde-onde',
    'seri muka',
    'kuih',
    'kuih lapis',
    'cendol',
    'green cake'
  ];

  constructor() {}

  isPandanRelated(text: string): boolean {
    if (!text) return false;
    const lowerText = text.toLowerCase();
    return this.PANDAN_KEYWORDS.some(keyword => lowerText.includes(keyword));
  }

  filterPandanPlaces(places: any[]): any[] {
    if (!places) return [];

    return places.filter(place => {
      const nameMatch = this.isPandanRelated(place.name);
      return nameMatch;
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
