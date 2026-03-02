import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login{
  loginForm: FormGroup;
  isLoading: boolean = false;
  showPassword: boolean = false;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

 onSubmit() {
  if (this.loginForm.valid) {
    this.isLoading = true;
    this.errorMessage = null;

    // Service to send login data to backend will be called here 
    const loginData = this.loginForm.value;
    console.log('Ready to send data to Backend:', loginData);

    setTimeout(() => {
      this.isLoading = false;
// TODO: Handle API response here (success or error)
      // For demonstration, we will assume login is successful and navigate to home page
    }, 1000);
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}