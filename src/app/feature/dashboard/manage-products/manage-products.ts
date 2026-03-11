import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductService, Product } from '../../../core/services/product.service';
import { CategoryService, Category } from '../../../core/services/category.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-manage-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './manage-products.html',
  styleUrls: ['./manage-products.css']
})
export class ManageProductsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);

  productForm: FormGroup;
  products: Product[] = [];
  isEditMode = false;
  currentProductId: string | null = null;
  errorMessage: string | null = null; 
  
  productIdToDelete: string | null = null;

  // Pagination
  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 1;
  totalProducts = 0;
  private pageCache = new Map<number, Product[]>();
  private maxKnownPage = 0;
  private firstEmptyPage: number | null = null;

  // Categories Multi-Select logic
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  categorySearchTerm = '';
  isDropdownOpen = false;

  private searchSubject = new Subject<string>();
  categoryCache = new Map<string, string>();

  constructor() {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      category: [[], Validators.required],
      price: [0, [Validators.required, Validators.min(1)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      description: [''],
      image: ['', Validators.required] 
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    
    // Set up search debouncing
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.fetchCategoriesFromApi(term);
    });

    // Initial load
    this.fetchCategoriesFromApi('');
  }

  loadProducts(): void {
    const cached = this.pageCache.get(this.currentPage);
    if (cached) {
      this.products = cached;
      this.updatePaginationForPage(this.currentPage, cached.length);
      this.prefetchNextTwoPages();
      return;
    }

    this.fetchPage(this.currentPage, true);
  }

  loadCategories(): void {
    this.fetchCategoriesFromApi('');
  }

  fetchCategoriesFromApi(term: string): void {
    const params: any = { limit: 5, page: 1 };
    
    if (term.trim()) {
      params['name'] = term.trim();
    }

    this.categoryService.getAllCategories(params).subscribe({
      next: (cats: any) => {
        let extractedCats: Category[] = [];
        if (Array.isArray(cats)) {
          extractedCats = cats;
        } else if (cats && cats.data && Array.isArray(cats.data)) {
          extractedCats = cats.data;
        } else if (cats && cats.data?.data && Array.isArray(cats.data.data)) {
          extractedCats = cats.data.data;
        } else if (cats && typeof cats === 'object') {
           const keys = Object.keys(cats);
           const firstArrayKey = keys.find(key => Array.isArray(cats[key]));
           if (firstArrayKey) extractedCats = cats[firstArrayKey];
        }
        
        extractedCats.forEach(c => {
          if (c._id) {
            this.categoryCache.set(c._id, c.name);
          }
        });

        this.categories = extractedCats;
        this.filteredCategories = extractedCats;
      },
      error: (err) => console.log('Could not load categories', err)
    });
  }

  filterCategories(): void {
    this.searchSubject.next(this.categorySearchTerm);
  }

  toggleCategory(catId: string): void {
    const current = this.productForm.get('category')?.value || [];
    const currentArr = Array.isArray(current) ? current : [current].filter(Boolean);

    if (currentArr.includes(catId)) {
      this.productForm.patchValue({ category: currentArr.filter((id: string) => id !== catId) });
    } else {
      this.productForm.patchValue({ category: [...currentArr, catId] });
    }
    this.productForm.get('category')?.markAsDirty();
  }

  isCategorySelected(catId: string): boolean {
    const current = this.productForm.get('category')?.value || [];
    const currentArr = Array.isArray(current) ? current : [current].filter(Boolean);
    return currentArr.includes(catId);
  }

  get selectedCategoryNames(): { id: string, name: string }[] {
    const current = this.productForm.get('category')?.value || [];
    const currentArr = Array.isArray(current) ? current : [current].filter(Boolean);
    return currentArr.map((id: string) => {
      // Look up from local cache first, otherwise check if they are in the filtered set, otherwise default to ID
      const cachedName = this.categoryCache.get(id);
      return { id, name: cachedName || id };
    });
  }

  removeCategory(catId: string, event: Event): void {
    event.stopPropagation();
    this.toggleCategory(catId);
  }

  onBlurDropdown(): void {
    setTimeout(() => {
      this.isDropdownOpen = false;
      this.categorySearchTerm = '';
      this.filterCategories();
    }, 200);
  }

  getCategoryDisplay(category: any): string {
    if (!category) return 'N/A';
    // If it's an array of objects
    if (Array.isArray(category)) {
      return category.map(c => typeof c === 'object' ? c.name || c._id : c).join(', ');
    }
    // If it's a single object
    if (typeof category === 'object') {
      return category.name || category._id;
    }
    // String ID
    return category;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) { 
        this.errorMessage = "The image is too large (Max: 1MB). Please compress it or choose another.";
        this.productForm.get('image')?.setErrors({ 'fileTooLarge': true });
        return;
      }

      this.errorMessage = null; 
      const reader = new FileReader();
      reader.onload = () => {
        this.productForm.patchValue({
          image: reader.result as string
        });
        this.productForm.get('image')?.markAsDirty();
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    this.errorMessage = null;

    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const productData = this.productForm.value;
    
    // If user's multi select provided an array but backend prefers first match or array.
    // For safety, we keep sending whatever the form produces (Array of IDs).
    
    if (this.isEditMode && this.currentProductId) {
      this.productService.updateProduct(this.currentProductId, productData).subscribe({
        next: () => {
          this.resetForm();
          this.loadProducts();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || "Update failed. Server responded with an error.";
        }
      });
    } else {
      this.productService.createProduct(productData).subscribe({
        next: () => {
          this.resetForm();
          this.loadProducts();
        },
        error: (err) => {
          if (err.status === 413) {
            this.errorMessage = "Server rejected the image because it's too large. Try a smaller file.";
          } else {
            this.errorMessage = err.error?.message || "An error occurred while saving.";
          }
        }
      });
    }
  }

  editProduct(product: Product): void {
    this.isEditMode = true;
    this.currentProductId = product._id || null;
    this.errorMessage = null;
    
    // Normalize Category mappings to Array of IDs and populate cache
    let categoryIds: string[] = [];
    if (Array.isArray(product.category)) {
      categoryIds = product.category.map(c => {
        if (typeof c === 'object' && c !== null) {
          if (c._id && c.name) {
            this.categoryCache.set(c._id, c.name);
          }
          return c._id;
        }
        return c;
      });
    } else if (product.category) {
      if (typeof product.category === 'object' && product.category !== null) {
        if ((product.category as any)._id && (product.category as any).name) {
          this.categoryCache.set((product.category as any)._id, (product.category as any).name);
        }
        categoryIds = [(product.category as any)._id];
      } else {
        categoryIds = [typeof product.category === 'string' ? product.category : String(product.category)];
      }
    }
    
    this.productForm.patchValue({
      name: product.name,
      category: categoryIds,
      price: product.price,
      stock: product.stock,
      description: product.description,
      image: product.image
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  prepareDelete(id: string): void {
    this.productIdToDelete = id;
  }

  confirmDelete(): void {
    if (this.productIdToDelete) {
      this.productService.deleteProduct(this.productIdToDelete).subscribe({
        next: () => {
          this.loadProducts();
          this.productIdToDelete = null; 
        },
        error: (err: any) => {
          this.errorMessage = "Delete failed. You might not have permission.";
        }
      });
    }
  }

  resetForm(): void {
    this.productForm.reset({ price: 0, stock: 0, category: [] });
    this.isEditMode = false;
    this.currentProductId = null;
    this.errorMessage = null;
    this.categorySearchTerm = '';
    Object.keys(this.productForm.controls).forEach(key => {
      this.productForm.get(key)?.setErrors(null);
    });
  }

  get pagesArray(): number[] {
    const array: number[] = [];
    const window = 2; // 2 left + current + 2 right
    const start = Math.max(1, this.currentPage - window);
    const end = Math.min(this.totalPages, this.currentPage + window);
    for (let i = start; i <= end; i++) {
      array.push(i);
    }
    return array;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadProducts();
    }
  }

  private fetchPage(page: number, setCurrent: boolean): void {
    const params = {
      page,
      limit: this.itemsPerPage,
      sort: '-createdAt',
    };

    this.productService.getAllProducts(params).subscribe({
      next: (res: any) => {
        let extractedProducts: Product[] = [];
        if (res.status === 'success' && res.data) {
          if (Array.isArray(res.data?.data)) {
            extractedProducts = res.data.data;
          } else if (Array.isArray(res.data)) {
            extractedProducts = res.data;
          } else if (res.data && typeof res.data === 'object') {
            const keys = Object.keys(res.data);
            const firstArrayKey = keys.find(key => Array.isArray(res.data[key]));
            if (firstArrayKey) extractedProducts = res.data[firstArrayKey];
          }
        } else if (Array.isArray(res?.data?.data)) {
          extractedProducts = res.data.data;
        }

        const pageResults = extractedProducts.length;
        this.pageCache.set(page, extractedProducts);

        if (pageResults === 0) {
          this.firstEmptyPage = this.firstEmptyPage
            ? Math.min(this.firstEmptyPage, page)
            : page;
          this.updateEffectiveTotalPages();
          if (setCurrent && page > 1) {
            this.currentPage = page - 1;
            this.loadProducts();
          }
          return;
        }

        this.maxKnownPage = Math.max(this.maxKnownPage, page);

        if (setCurrent) {
          this.products = extractedProducts;
          this.updatePaginationForPage(page, pageResults);
          this.prefetchNextTwoPages();
        } else {
          this.updateEffectiveTotalPages();
        }
      },
      error: () => {
        this.errorMessage = "Could not load products. Please check your connection.";
      }
    });
  }

  private updatePaginationForPage(page: number, pageResults: number): void {
    if (pageResults === 0) {
      this.firstEmptyPage = this.firstEmptyPage
        ? Math.min(this.firstEmptyPage, page)
        : page;
    } else {
      this.maxKnownPage = Math.max(this.maxKnownPage, page);
    }
    this.updateEffectiveTotalPages();
  }

  private updateEffectiveTotalPages(): void {
    const windowRight = 2;
    let inferred = Math.max(this.maxKnownPage, this.currentPage + windowRight);
    if (this.firstEmptyPage !== null) {
      inferred = Math.min(inferred, Math.max(1, this.firstEmptyPage - 1));
    }
    this.totalPages = Math.max(1, inferred);
  }

  private prefetchNextTwoPages(): void {
    const next1 = this.currentPage + 1;
    const next2 = this.currentPage + 2;

    if (this.firstEmptyPage !== null && next1 >= this.firstEmptyPage) return;

    if (!this.pageCache.has(next1)) {
      this.fetchPage(next1, false);
    }
    if (!this.pageCache.has(next2)) {
      this.fetchPage(next2, false);
    }
  }
}
