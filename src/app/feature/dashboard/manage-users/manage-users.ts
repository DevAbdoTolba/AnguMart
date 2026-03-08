import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule, DecimalPipe, TitleCasePipe } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, DecimalPipe, TitleCasePipe],
  templateUrl: './manage-users.html',
  styleUrl: './manage-users.css'
})
export class ManageUsers implements OnInit {
  private router = inject(Router); 
  // Starts empty as requested
  users = signal<any[]>([]); 
  searchTerm = signal('');

  // Total count for the top header
  totalUsers = computed(() => this.users().length);

  // Search logic
  filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.users().filter(u => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
  });

  ngOnInit() {
    // Logic to call your backend service will go here
   
  }
  viewProfile(userId: number) {
    this.router.navigate(['/dashboard/user-profile', userId]);
  }
updateSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }
toggleBlock(user: any) {
    user.isBlocked = !user.isBlocked;
        user.status = user.isBlocked ? 'Restricted' : 'Approved';
    
    this.users.set([...this.users()]);
    
    console.log(`User ${user.name} is now ${user.status}`);
  }
currentPage = signal(1);

goToPage(page: number, event: Event) {
  event.preventDefault(); 
  
  if (page >= 1 && page <= 3) { 
    this.currentPage.set(page);
    
    
    // this.userService.getUsers(page).subscribe(...)
  }
}
}