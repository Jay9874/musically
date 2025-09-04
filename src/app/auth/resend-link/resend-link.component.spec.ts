import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResendLinkComponent } from './resend-link.component';

describe('ResendLinkComponent', () => {
  let component: ResendLinkComponent;
  let fixture: ComponentFixture<ResendLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResendLinkComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResendLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
