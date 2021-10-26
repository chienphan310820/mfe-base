import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseModuleModalComponent } from './choose-module-modal.component';

describe('ChooseOrgModalComponent', () => {
  let component: ChooseModuleModalComponent;
  let fixture: ComponentFixture<ChooseModuleModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChooseModuleModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChooseModuleModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
