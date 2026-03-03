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
  showPassword: boolean = false; 

  constructor(private fb: FormBuilder, private router: Router) {
    this.signupForm = this.fb.group({
      fullName: ['', [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(60)
      ]],
      email: ['', [
        Validators.required, 
        Validators.email
      ]],
      phone: ['', [
        Validators.required, 
        Validators.pattern('^01[0125][0-9]{8}$'),
        Validators.minLength(11), 
        Validators.maxLength(11)
      ]],
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

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.isLoading = true;
      setTimeout(() => {
        this.isLoading = false; 
        this.router.navigate(['/login']);
      }, 2000);
    } else {
      this.signupForm.markAllAsTouched(); 
    }
  }
}