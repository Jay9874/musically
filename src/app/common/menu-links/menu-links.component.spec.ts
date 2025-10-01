import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuLinksComponent } from './menu-links.component';

describe('MenuLinksComponent', () => {
  let component: MenuLinksComponent;
  let fixture: ComponentFixture<MenuLinksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuLinksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuLinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
