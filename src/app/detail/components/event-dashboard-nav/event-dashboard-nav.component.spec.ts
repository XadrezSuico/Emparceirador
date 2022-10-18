/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EventDashboardNavComponent } from './event-dashboard-nav.component';

describe('EventDashboardNavComponent', () => {
  let component: EventDashboardNavComponent;
  let fixture: ComponentFixture<EventDashboardNavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventDashboardNavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventDashboardNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
