import { Component, inject } from '@angular/core';
import { QuakeStore } from '../../services/quake-store';
import { form, FormField, min, max } from "@angular/forms/signals";

@Component({
  selector: 'app-quake-filters',
  imports: [FormField],
  templateUrl: './quake-filters.html',
  styleUrl: './quake-filters.css',
})
export class QuakeFilters {
  private store = inject(QuakeStore);
  filterForm = form(this.store.filters, (schemaPath) => {
    min(schemaPath.minMag, 0, { message: 'Magnitude must be greater than or equal to 0' });
    max(schemaPath.minMag, 8, { message: 'Magnitude cannot exceed 8' });

    max(schemaPath.sinceHours, 168);
  });
}
