import { Routes } from '@angular/router';
import { Signup} from './feature/auth/signup/signup';
import { Login } from './feature/auth/login/login';
export const routes: Routes = [
  { path: 'signup', component: Signup },
  { path: 'login', component: Login}, 
  { path: '', redirectTo: 'signup', pathMatch: 'full' }
];