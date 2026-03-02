import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true, 
  imports: [CommonModule, ReactiveFormsModule, RouterLink], 
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']
})
export class Signup {
  signupForm: FormGroup;

  isLoading: boolean = false;
  errorMessages = [
    { type: 'required', message: 'This field is mandatory' },
    { type: 'email', message: 'Please enter a valid email' },
    { type: 'minlength', message: 'Minimum length not reached' }
  ];

  constructor(private fb: FormBuilder, private router: Router) {
    this.signupForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^01[0125][0-9]{8}$')]],
      password: ['', [Validators.required, Validators.minLength(8)]],
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
  showPassword: boolean = false; 

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.isLoading = true;
      console.log('Form Submitted!', this.signupForm.value);
      setTimeout(() => {
      this.isLoading = false; 
      this.router.navigate(['/login']);
    }, 2000);    } else {
      this.signupForm.markAllAsTouched(); 
    }
  }
}