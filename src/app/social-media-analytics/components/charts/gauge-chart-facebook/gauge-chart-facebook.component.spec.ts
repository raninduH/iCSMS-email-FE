import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GaugeChartFacebookComponent } from './gauge-chart-facebook.component';

describe('GaugeChartFacebookComponent', () => {
  let component: GaugeChartFacebookComponent;
  let fixture: ComponentFixture<GaugeChartFacebookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GaugeChartFacebookComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GaugeChartFacebookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
