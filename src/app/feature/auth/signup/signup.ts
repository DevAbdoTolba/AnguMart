import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Navbar } from '../../../layout/navbar/navbar';
import { Auth } from '../../../core/services/auth/auth';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, Navbar],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']
})
export class Signup implements OnInit {
  signupForm: FormGroup;
  isLoading: boolean = false;
  showPassword: boolean = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: Auth
  ) {
    this.signupForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(60)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^01[0125][0-9]{8}$'), Validators.minLength(11), Validators.maxLength(11)]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(50),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^0-9a-zA-Z]).{8,50}$')
      ]],
      confirmPassword: ['', [Validators.required]],
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirm = control.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  ngOnInit(): void {
    if (localStorage.getItem('angumart_token')) {
      this.router.navigate(['/profile']);
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.isLoading = true;
      this.successMessage = null;
      this.errorMessage = null;

      const signUpData = {
        name: this.signupForm.value.fullName,
        email: this.signupForm.value.email,
        phone: this.signupForm.value.phone,
        password: this.signupForm.value.password
      };

      this.authService.register(signUpData).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.successMessage = 'Registration successful! A confirmation email has been sent. Please check your inbox to verify your account.';
          this.signupForm.reset();
        },
        error: (err: any) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Something went wrong, please try again.';
        }
      });
    } else {
      this.signupForm.markAllAsTouched();
    }
  }
}
