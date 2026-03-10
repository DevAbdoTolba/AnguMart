import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductService, Product } from '../../../core/services/product.service';

@Component({
  selector: 'app-manage-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './manage-products.html',
  styleUrls: ['./manage-products.css']
})
export class ManageProductsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);

  productForm: FormGroup;
  products: Product[] = [];
  isEditMode = false;
  currentProductId: string | null = null;
  errorMessage: string | null = null; 
  
  // متغير جديد لحفظ الـ ID المراد حذفه مؤقتاً
  productIdToDelete: string | null = null;

  constructor() {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      category: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(1)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      description: [''],
      image: ['', Validators.required] 
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (res: any) => {
        if (res.status === 'success' && res.data) {
          if (Array.isArray(res.data)) {
            this.products = res.data;
          } else {
            const keys = Object.keys(res.data);
            const firstArrayKey = keys.find(key => Array.isArray(res.data[key]));
            if (firstArrayKey) this.products = res.data[firstArrayKey];
          }
        }
      },
      error: (err: any) => {
        this.errorMessage = "Could not load products. Please check your connection.";
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB Limit
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

    if (this.isEditMode && this.currentProductId) {
      this.productService.updateProduct(this.currentProductId, productData).subscribe({
        next: () => {
          this.resetForm();
          this.loadProducts();
        },
        error: (err) => {
          this.errorMessage = "Update failed. Server responded with an error.";
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
    
    this.productForm.patchValue({
      name: product.name,
      category: typeof product.category === 'object' ? product.category._id : product.category,
      price: product.price,
      stock: product.stock,
      description: product.description,
      image: product.image
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // دالة لتجهيز عملية الحذف وتخزين الـ ID
  prepareDelete(id: string): void {
    this.productIdToDelete = id;
  }

  // دالة الحذف الفعلية التي يتم استدعاؤها من الـ Modal
  confirmDelete(): void {
    if (this.productIdToDelete) {
      this.productService.deleteProduct(this.productIdToDelete).subscribe({
        next: () => {
          this.loadProducts();
          this.productIdToDelete = null; // تصفير المتغير بعد النجاح
        },
        error: (err: any) => {
          this.errorMessage = "Delete failed. You might not have permission.";
        }
      });
    }
  }

  resetForm(): void {
    this.productForm.reset({ price: 0, stock: 0 });
    this.isEditMode = false;
    this.currentProductId = null;
    this.errorMessage = null;
    Object.keys(this.productForm.controls).forEach(key => {
      this.productForm.get(key)?.setErrors(null);
    });
  }
}