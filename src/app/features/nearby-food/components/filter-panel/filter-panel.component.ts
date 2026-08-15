import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-filter-panel',
  templateUrl: './filter-panel.component.html',
  styleUrls: ['./filter-panel.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
    MatButtonToggleModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class FilterPanelComponent {
  radius = 1000;
  sort = 'distance';
  minRating = 0;
  openNow = false;
  keyword = '';
  featuredOnly = false;
  isCollapsed = true;

  @Output() filterChange = new EventEmitter<any>();

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleFeaturedOnly() {
    this.featuredOnly = !this.featuredOnly;
    this.emitChanges();
  }

  emitChanges() {
    this.filterChange.emit({
      radius: this.radius,
      sort: this.sort,
      minRating: this.minRating,
      openNow: this.openNow,
      keyword: this.keyword,
      featuredOnly: this.featuredOnly
    });
  }
}
