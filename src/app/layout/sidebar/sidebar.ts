import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.html',
  styles: ``,
})
export class Sidebar {
  title = input<string>('Filters');
  clearLabel = input<string>('Clear All');
  showClear = input<boolean>(true);

  clearClicked = output<void>();

  onClear(): void {
    this.clearClicked.emit();
  }
}
