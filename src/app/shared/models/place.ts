export interface Place {
  id: string;
  name: string;
  rating?: number;
  userRatingsTotal?: number;
  address?: string;
  distance?: number; // In meters
  photos?: string[];
  openNow?: boolean;
  businessHours?: string[];
  googleMapsLink?: string;
  isFeaturedSpot?: boolean;
  location: {
    lat: number;
    lng: number;
  };
}
