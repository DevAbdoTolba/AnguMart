import { Component, output } from '@angular/core';
import { Sidebar } from '../../../layout/sidebar/sidebar';

export interface FilterGroup {
  title: string;
  options: FilterOption[];
}

export interface FilterOption {
  label: string;
  checked: boolean;
}

export interface CategoryChip {
  label: string;
  active: boolean;
}

export interface ActiveFilters {
  categories: string[];
  priceRanges: string[];
  ratings: string[];
}

@Component({
  selector: 'app-product-filter',
  imports: [Sidebar],
  templateUrl: './product-filter.html',
  styleUrl: './product-filter.css',
})
export class ProductFilter {
  filtersChanged = output<ActiveFilters>();
  clearFilters = output<void>();

  filterGroups: FilterGroup[] = this.generateFilterGroups();
  categoryChips: CategoryChip[] = this.generateCategoryChips();

  private generateFilterGroups(): FilterGroup[] {
    const categoryNames = new Array(5)
      .fill(null)
      .map((_, i) => ['Electronics', 'Clothing', 'Home & Kitchen', 'Sports', 'Books'][i]);

    const priceLabels = new Array(5)
      .fill(null)
      .map((_, i) => ['Under $25', '$25 – $50', '$50 – $100', '$100 – $200', 'Over $200'][i]);

    const ratingLabels = new Array(3)
      .fill(null)
      .map((_, i) => ['★★★★★', '★★★★☆ & up', '★★★☆☆ & up'][i]);

    return [
      {
        title: 'Category',
        options: categoryNames.map((label) => ({ label, checked: false })),
      },
      {
        title: 'Price Range',
        options: priceLabels.map((label) => ({ label, checked: false })),
      },
      {
        title: 'Rating',
        options: ratingLabels.map((label) => ({ label, checked: false })),
      },
    ];
  }

  private generateCategoryChips(): CategoryChip[] {
    const chipLabels = new Array(7)
      .fill(null)
      .map((_, i) => ['All', 'Electronics', 'Clothing', 'Home & Kitchen', 'Sports', 'Books', 'Toys'][i]);

    return chipLabels.map((label, index) => ({
      label,
      active: index === 0,
    }));
  }

  onChipClick(selectedChip: CategoryChip): void {
    this.categoryChips.forEach((chip) => (chip.active = false));
    selectedChip.active = true;
    this.emitFilters();
  }

  onFilterChange(): void {
    this.emitFilters();
  }

  onClearAll(): void {
    this.filterGroups.forEach((group) =>
      group.options.forEach((option) => (option.checked = false))
    );
    this.categoryChips.forEach((chip) => (chip.active = false));
    this.categoryChips[0].active = true;
    this.clearFilters.emit();
    this.filtersChanged.emit({ categories: [], priceRanges: [], ratings: [] });
  }

  private emitFilters(): void {
    const activeFilters: ActiveFilters = {
      categories: this.filterGroups[0].options
        .filter((o) => o.checked)
        .map((o) => o.label),
      priceRanges: this.filterGroups[1].options
        .filter((o) => o.checked)
        .map((o) => o.label),
      ratings: this.filterGroups[2].options
        .filter((o) => o.checked)
        .map((o) => o.label),
    };
    this.filtersChanged.emit(activeFilters);
  }
}
