import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Place } from '../../../../shared/models/place';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-food-card',
  templateUrl: './food-card.component.html',
  styleUrls: ['./food-card.component.scss'],
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule]
})
export class FoodCardComponent {
  @Input() place!: Place;
  @Output() select = new EventEmitter<Place>();

  onSelect() {
    this.select.emit(this.place);
  }

  getGoogleMapsLink() {
     if (this.place.googleMapsLink) {
         window.open(this.place.googleMapsLink, '_blank');
     } else {
         const query = encodeURIComponent(this.place.name + ' ' + (this.place.address || ''));
         window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
     }
  }
}
