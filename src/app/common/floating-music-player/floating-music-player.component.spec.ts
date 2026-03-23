import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloatingMusicPlayerComponent } from './floating-music-player.component';

describe('FloatingMusicPlayerComponent', () => {
  let component: FloatingMusicPlayerComponent;
  let fixture: ComponentFixture<FloatingMusicPlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloatingMusicPlayerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FloatingMusicPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
