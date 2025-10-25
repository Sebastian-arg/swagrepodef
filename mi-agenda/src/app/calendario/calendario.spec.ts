import { TestBed } from '@angular/core/testing';
import { CalendarioComponent } from './calendario';

describe('CalendarioComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarioComponent],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(CalendarioComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should initialize with month view', () => {
    const fixture = TestBed.createComponent(CalendarioComponent);
    const component = fixture.componentInstance;
    expect(component.view()).toBe('month');
  });

  it('should render calendar header', () => {
    const fixture = TestBed.createComponent(CalendarioComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.toolbar')).toBeTruthy();
  });
});
