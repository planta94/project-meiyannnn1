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

  isFeaturedSpot(place: any): boolean {
    if (!place || !place.name) return false;
    if (typeof place.rating === 'number' && place.rating >= 4.2) return true;
    if (this.isPandanRelated(place.name)) return true;
    const lowerName = place.name.toLowerCase();
    const featuredKeywords = ['cafe', 'coffee', 'bakery', 'dessert', 'nasi lemak', 'kuih', 'breakfast', 'tea', 'bistro', 'restaurant'];
    return featuredKeywords.some(k => lowerName.includes(k));
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

  /**
   * Evaluates whether a place is currently open based on opening hours data.
   * Supports direct booleans, live isOpen() functions, weekday text strings,
   * period object arrays, and raw Google Places array structures.
   */
  isPlaceOpenNow(openingHoursData: any, now: Date = new Date()): boolean | undefined {
    if (openingHoursData === undefined || openingHoursData === null) return undefined;

    // 1. Direct boolean property check
    if (typeof openingHoursData === 'boolean') return openingHoursData;
    if (typeof openingHoursData.openNow === 'boolean') return openingHoursData.openNow;
    if (typeof openingHoursData.open_now === 'boolean') return openingHoursData.open_now;
    if (typeof openingHoursData.opening_hours?.open_now === 'boolean') return openingHoursData.opening_hours.open_now;
    if (typeof openingHoursData.opening_hours?.openNow === 'boolean') return openingHoursData.opening_hours.openNow;
    if (typeof openingHoursData.regularOpeningHours?.openNow === 'boolean') return openingHoursData.regularOpeningHours.openNow;

    // 2. Direct isOpen() method execution
    const isOpenFn = openingHoursData.isOpen || openingHoursData.regularOpeningHours?.isOpen || openingHoursData.opening_hours?.isOpen;
    if (typeof isOpenFn === 'function') {
      try {
        const liveStatus = isOpenFn.call(openingHoursData);
        if (typeof liveStatus === 'boolean') return liveStatus;
      } catch (e) {
        // Fall back to schedule extraction below
      }
    }

    // 3. Extract and parse weekday descriptions text (e.g. "Monday: 5:00 AM – 6:00 PM")
    const weekdayText = this.extractWeekdayText(openingHoursData);
    if (weekdayText && weekdayText.length > 0) {
      const parsedFromText = this.evaluateOpenFromWeekdayText(weekdayText, now);
      if (parsedFromText !== undefined) {
        return parsedFromText;
      }
    }

    // 4. Extract and parse periods structure
    const periods = this.extractPeriods(openingHoursData);
    if (periods && periods.length > 0) {
      const parsedFromPeriods = this.evaluateOpenFromPeriods(periods, now);
      if (parsedFromPeriods !== undefined) {
        return parsedFromPeriods;
      }
    }

    // 5. Fallback check for open_now / openNow inside sub-objects if schedules absent
    if (typeof openingHoursData.open_now === 'boolean') return openingHoursData.open_now;
    if (typeof openingHoursData.openNow === 'boolean') return openingHoursData.openNow;

    return undefined;
  }

  /**
   * Extracts an array of weekday text schedule strings from various Google Places response formats.
   */
  extractWeekdayText(data: any): string[] | undefined {
    if (!data) return undefined;

    if (Array.isArray(data)) {
      if (data.length > 0 && typeof data[0] === 'string' && this.containsDayName(data[0])) {
        return data as string[];
      }
      for (const item of data) {
        if (Array.isArray(item) && item.length > 0 && typeof item[0] === 'string' && this.containsDayName(item[0])) {
          return item as string[];
        }
      }
    }

    const textArr = data.weekdayDescriptions ||
                    data.weekday_text ||
                    data.weekdayText ||
                    data.businessHours ||
                    data.regularOpeningHours?.weekdayDescriptions ||
                    data.opening_hours?.weekday_text ||
                    data.opening_hours?.weekdayDescriptions;

    if (Array.isArray(textArr) && textArr.length > 0) {
      return textArr as string[];
    }

    return undefined;
  }

  private containsDayName(str: string): boolean {
    if (!str || typeof str !== 'string') return false;
    const lower = str.toLowerCase();
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return days.some(d => lower.includes(d));
  }

  private evaluateOpenFromWeekdayText(weekdayText: string[], now: Date): boolean | undefined {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDayName = days[now.getDay()];

    const targetLine = weekdayText.find(line => {
      if (typeof line !== 'string') return false;
      const lower = line.toLowerCase();
      return lower.startsWith(currentDayName) || lower.includes(`${currentDayName}:`) || lower.includes(currentDayName);
    });

    if (!targetLine) return undefined;

    const cleanedLine = targetLine
      .replace(/[\u202F\u2009\u00A0]/g, ' ')
      .replace(/[\u2013\u2014\u2212]/g, '-')
      .trim();

    const lowerLine = cleanedLine.toLowerCase();

    if (lowerLine.includes('closed') && !lowerLine.includes('open')) {
      return false;
    }

    if (lowerLine.includes('24 hours') || lowerLine.includes('open 24')) {
      return true;
    }

    const colonIdx = cleanedLine.indexOf(':');
    const scheduleText = colonIdx !== -1 ? cleanedLine.substring(colonIdx + 1) : cleanedLine;

    const shifts = scheduleText.split(',');
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    let hasValidShift = false;

    for (const shift of shifts) {
      const parts = shift.split('-').map(s => s.trim()).filter(Boolean);
      if (parts.length >= 2) {
        const startMins = this.parseTimeToMinutes(parts[0]);
        const endMins = this.parseTimeToMinutes(parts[1]);

        if (startMins !== null && endMins !== null) {
          hasValidShift = true;
          if (startMins <= endMins) {
            if (currentMinutes >= startMins && currentMinutes < endMins) {
              return true;
            }
          } else {
            if (currentMinutes >= startMins || currentMinutes < endMins) {
              return true;
            }
          }
        }
      }
    }

    return hasValidShift ? false : undefined;
  }

  private parseTimeToMinutes(str: string): number | null {
    if (!str) return null;
    const cleanStr = str.trim().toLowerCase();
    const isPm = cleanStr.includes('pm');
    const isAm = cleanStr.includes('am');

    const match = cleanStr.match(/(\d{1,2})(?::(\d{2}))?/);
    if (!match) return null;

    let hour = parseInt(match[1], 10);
    const minute = match[2] ? parseInt(match[2], 10) : 0;

    if (isNaN(hour) || isNaN(minute)) return null;

    if (isPm && hour < 12) hour += 12;
    if (isAm && hour === 12) hour = 0;

    return hour * 60 + minute;
  }

  extractPeriods(data: any): any[] | undefined {
    if (!data) return undefined;

    if (Array.isArray(data)) {
      if (data.length > 0 && Array.isArray(data[0])) {
        if (data[0].length > 0 && (Array.isArray(data[0][0]) || data[0][0]?.open)) {
          return data;
        }
      }
      for (const item of data) {
        if (Array.isArray(item) && item.length > 0 && Array.isArray(item[0]) && (Array.isArray(item[0][0]) || item[0][0]?.open)) {
          return item;
        }
      }
    }

    const periods = data.periods ||
                    data.regularOpeningHours?.periods ||
                    data.opening_hours?.periods;

    if (Array.isArray(periods) && periods.length > 0) {
      return periods;
    }

    return undefined;
  }

  private evaluateOpenFromPeriods(periods: any[], now: Date): boolean | undefined {
    if (!periods || periods.length === 0) return undefined;

    if (periods.length === 1) {
      const p = periods[0];
      if ((p.open && !p.close) || (Array.isArray(p) && p.length === 1)) {
        return true;
      }
    }

    const currentDay = now.getDay();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    let checkedPeriodsForToday = false;

    for (const period of periods) {
      let openDay: number | undefined;
      let openHour: number | undefined;
      let openMin: number | undefined;

      let closeDay: number | undefined;
      let closeHour: number | undefined;
      let closeMin: number | undefined;

      if (Array.isArray(period)) {
        const openArr = period[0];
        const closeArr = period[1];

        if (Array.isArray(openArr)) {
          openDay = openArr[0];
          openHour = openArr[1];
          openMin = openArr[2] ?? 0;
        }

        if (Array.isArray(closeArr)) {
          closeDay = closeArr[0];
          closeHour = closeArr[1];
          closeMin = closeArr[2] ?? 0;
        }
      } else if (typeof period === 'object' && period !== null) {
        if (period.open) {
          openDay = period.open.day;
          openHour = period.open.hour ?? period.open.hours ?? parseInt((period.open.time || '0').slice(0, 2), 10);
          openMin = period.open.minute ?? period.open.minutes ?? parseInt((period.open.time || '0').slice(2, 4), 10);
        }

        if (period.close) {
          closeDay = period.close.day;
          closeHour = period.close.hour ?? period.close.hours ?? parseInt((period.close.time || '0').slice(0, 2), 10);
          closeMin = period.close.minute ?? period.close.minutes ?? parseInt((period.close.time || '0').slice(2, 4), 10);
        }
      }

      if (openDay === undefined || openHour === undefined) continue;

      if (openDay === currentDay) {
        checkedPeriodsForToday = true;
      }

      const openTimeMinutes = openHour * 60 + (openMin || 0);

      if (closeDay === undefined || closeHour === undefined) {
        if (openDay === currentDay) return true;
        continue;
      }

      const closeTimeMinutes = closeHour * 60 + (closeMin || 0);

      if (openDay === closeDay) {
        if (currentDay === openDay && currentMinutes >= openTimeMinutes && currentMinutes < closeTimeMinutes) {
          return true;
        }
      } else {
        if (currentDay === openDay && currentMinutes >= openTimeMinutes) {
          return true;
        }
        if (currentDay === closeDay && currentMinutes < closeTimeMinutes) {
          return true;
        }
      }
    }

    return checkedPeriodsForToday ? false : undefined;
  }
}

