import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MusicCollectionsComponent } from './music-collections.component';

describe('MusicCollectionsComponent', () => {
  let component: MusicCollectionsComponent;
  let fixture: ComponentFixture<MusicCollectionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MusicCollectionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MusicCollectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
