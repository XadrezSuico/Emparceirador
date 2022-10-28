import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPlayersComponent } from './list-players.component';

describe('ListPlayersComponent', () => {
  let component: ListPlayersComponent;
  let fixture: ComponentFixture<ListPlayersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListPlayersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListPlayersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
