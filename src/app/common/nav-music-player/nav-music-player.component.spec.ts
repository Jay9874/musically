import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavMusicPlayerComponent } from './nav-music-player.component';

describe('NavMusicPlayerComponent', () => {
  let component: NavMusicPlayerComponent;
  let fixture: ComponentFixture<NavMusicPlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavMusicPlayerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavMusicPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
