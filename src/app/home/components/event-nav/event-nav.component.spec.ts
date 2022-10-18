/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EventNavComponent } from './event-nav.component';

describe('EventNavComponent', () => {
  let component: EventNavComponent;
  let fixture: ComponentFixture<EventNavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventNavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
