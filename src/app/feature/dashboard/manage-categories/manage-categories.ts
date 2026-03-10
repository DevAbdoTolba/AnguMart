import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService, Category } from '../../../core/services/category.service';

@Component({
  selector: 'app-manage-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-categories.html',
  styleUrls: ['./manage-categories.css']
})
export class ManageCategoriesComponent implements OnInit {
  private categoryService = inject(CategoryService);

  categories: Category[] = [];
  newCategoryName: string = '';
  editMode: boolean = false;
  selectedCategory: Category = { name: '' };
  categoryIdToDelete: string = ''; 

  message: string | null = null;
  isError: boolean = false;

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (res: any) => {
        console.log('API Response:', res);

        if (res && res.data && Array.isArray(res.data)) {
          this.categories = res.data;
        } 
        else if (Array.isArray(res)) {
          this.categories = res;
        } 
        else {
          this.categories = [];
          console.warn('Warning: Response is not an array, check your API structure.');
        }
      },
      error: (err) => {
        console.error('Error loading data:', err);
        this.showMsg("Could not load categories", true);
      }
    });
  }

  addCategory(): void {
    if (!this.newCategoryName.trim()) return;
    this.categoryService.createCategory(this.newCategoryName).subscribe({
      next: () => {
        this.newCategoryName = '';
        this.loadCategories();
        this.showMsg("Category added successfully!");
      },
      error: (err) => this.showMsg(err.error?.message || "Error adding category", true)
    });
  }

  onEdit(category: Category): void {
    this.editMode = true;
    this.selectedCategory = { ...category };
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  }

  updateCategory(): void {
    if (!this.selectedCategory._id || !this.selectedCategory.name) return;
    this.categoryService.updateCategory(this.selectedCategory._id, this.selectedCategory.name).subscribe({
      next: () => {
        this.editMode = false;
        this.loadCategories();
        this.showMsg("Category updated!");
      },
      error: () => this.showMsg("Update failed", true)
    });
  }

  onDelete(id: string): void {
    this.categoryIdToDelete = id;
  }

  confirmDelete(): void {
    if (!this.categoryIdToDelete) return;

    this.categoryService.deleteCategory(this.categoryIdToDelete).subscribe({
      next: () => {
        this.loadCategories();
        this.showMsg("Category deleted successfully");
        this.categoryIdToDelete = ''; 
      },
      error: (err) => {
        this.showMsg("Delete failed. Category may be linked to products.", true);
        console.error(err);
      }
    });
  }

  cancelEdit(): void {
    this.editMode = false;
    this.selectedCategory = { name: '' };
  }

  private showMsg(text: string, error: boolean = false): void {
    this.message = text;
    this.isError = error;
    setTimeout(() => this.message = null, 3000);
  }
}