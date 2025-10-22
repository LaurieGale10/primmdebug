import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { CodeEditorComponent } from './code-editor.component';

describe('CodeEditorComponent', () => {
  let component: CodeEditorComponent;
  let fixture: ComponentFixture<CodeEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeEditorComponent, NoopAnimationsModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CodeEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
    describe('UI loading and error states', () => {
      it('should show mat-spinner when iFrame is loading', () => {
        component.iFrameLoading.set(true);
        component.iFrameSuccessfullyLoaded.set(false);
        fixture.detectChanges();
        const spinner = fixture.debugElement.query(By.css('mat-spinner'));
        expect(spinner).toBeTruthy();
      });

      it('should show error page if iFrame fails to load', () => {
        component.iFrameLoading.set(false);
        component.iFrameSuccessfullyLoaded.set(false);
        // Simulate error state if you have a signal for error
        // component.iFrameLoadError.set(true); // Uncomment if error signal exists
        fixture.detectChanges();
        const errorPage = fixture.debugElement.query(By.css('.has-unsuccessfully-loaded'));
        expect(errorPage).toBeTruthy();
      });

      it('should show actual content when iFrame loads successfully', () => {
        component.iFrameLoading.set(false);
        component.iFrameSuccessfullyLoaded.set(true);
        fixture.detectChanges();
        const content = fixture.debugElement.query(By.css('.code-editor-iframe'));
        expect(content).toBeTruthy();
      });

      it('should transition from spinner to content after iFrame loads', () => {
        component.iFrameLoading.set(true);
        //component.iFrameSuccessfullyLoaded.set(false);
        fixture.detectChanges();
        let spinner = fixture.debugElement.query(By.css('mat-spinner'));
        expect(spinner).toBeTruthy();
        component.iFrameLoading.set(false);
        component.iFrameSuccessfullyLoaded.set(true);
        fixture.detectChanges();
        spinner = fixture.debugElement.query(By.css('mat-spinner'));
        expect(spinner).toBeFalsy();
        const content = fixture.debugElement.query(By.css('.code-editor-iframe'));
        expect(content).toBeTruthy();
      });

      it('should show loading indicator on initial render before load events', () => {
        component.iFrameLoading.set(true);
        component.iFrameSuccessfullyLoaded.set(false);
        fixture.detectChanges();
        const spinner = fixture.debugElement.query(By.css('mat-spinner'));
        expect(spinner).toBeTruthy();
      });
    });
});
