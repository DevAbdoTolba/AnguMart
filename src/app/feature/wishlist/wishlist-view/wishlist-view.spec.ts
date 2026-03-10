import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WishlistView } from './wishlist-view';

describe('WishlistView', () => {
  let component: WishlistView;
  let fixture: ComponentFixture<WishlistView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WishlistView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WishlistView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
