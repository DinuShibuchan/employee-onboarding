import { Component, computed, effect, signal, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormField, FormRoot, form } from '@angular/forms/signals';
import {
  DEPARTMENT_DESIGNATIONS,
  EmploymentType,
  INITIAL_ONBOARDING,
  Onboarding,
} from './models/onboarding.model';
import { onboardingSchema } from './forms/onboarding.schema';
import { StarRatingComponent } from './components/star-rating/star-rating.component';
import { FieldErrorComponent } from './components/field-error/field-error.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormField,
    FormRoot,
    StarRatingComponent,
    FieldErrorComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  // Model signal
  readonly onboardingModel = signal<Onboarding>({
    ...INITIAL_ONBOARDING,
    address: { ...INITIAL_ONBOARDING.address },
    skills: INITIAL_ONBOARDING.skills.map((s) => ({ ...s })),
  });

  // Signal Form with schema
  readonly onboardingForm = form(this.onboardingModel, onboardingSchema);

  // Department definitions
  readonly departments = Object.keys(DEPARTMENT_DESIGNATIONS);
  private lastDept = this.onboardingModel().department;

  // Available designations computed reactively from selected department
  readonly availableDesignations = computed(() => {
    const currentDept = this.onboardingForm.department().value();
    return DEPARTMENT_DESIGNATIONS[currentDept] || [];
  });

  // Submission tracking
  readonly hasSubmitted = signal<boolean>(false);
  readonly showSuccess = signal<boolean>(false);
  readonly submittedEmployeeName = signal<string>('');

  constructor() {
    // Clear designation whenever department changes
    effect(() => {
      const currentDept = this.onboardingModel().department;
      untracked(() => {
        if (currentDept !== this.lastDept) {
          this.lastDept = currentDept;
          if (this.onboardingModel().designation) {
            this.onboardingForm.designation().value.set('');
          }
        }
      });
    });

    // Reset end date if employment type is changed to Full-time
    effect(() => {
      const type = this.onboardingModel().employmentType;
      untracked(() => {
        if (type === 'Full-time' && this.onboardingModel().endDate !== null) {
          this.onboardingForm.endDate().value.set(null);
        }
      });
    });
  }

  onDepartmentSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const dept = select.value;
    this.onboardingForm.department().value.set(dept);
    this.onboardingForm.designation().value.set('');
    this.onboardingForm.department().markAsTouched();
  }

  onEmploymentTypeSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const type = select.value as EmploymentType;
    this.onboardingForm.employmentType().value.set(type);
    if (type === 'Full-time') {
      this.onboardingForm.endDate().value.set(null);
    }
    this.onboardingForm.employmentType().markAsTouched();
  }

  addSkill(): void {
    if (this.onboardingModel().skills.length >= 6) return;
    this.onboardingModel.update((prev) => ({
      ...prev,
      skills: [...prev.skills, { name: '', rating: 0 }],
    }));
  }

  removeSkill(index: number): void {
    if (this.onboardingModel().skills.length <= 2) return;
    this.onboardingModel.update((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  }

  onSubmit(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.hasSubmitted.set(true);

    if (!this.onboardingForm().valid() || this.onboardingForm().pending()) {
      return;
    }

    const employee = this.onboardingModel();
    const fullName = `${employee.firstName} ${employee.lastName}`.trim();
    this.submittedEmployeeName.set(fullName);
    this.showSuccess.set(true);

    // Reset the form
    this.resetForm();
  }

  dismissSuccess(): void {
    this.showSuccess.set(false);
  }

  resetForm(): void {
    this.onboardingModel.set({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      employmentType: 'Full-time',
      department: '',
      designation: '',
      joiningDate: '',
      endDate: null,
      managerEmail: '',
      address: { line1: '', city: '', pin: '' },
      skills: [
        { name: '', rating: 0 },
        { name: '', rating: 0 },
      ],
    });
    this.lastDept = '';
    this.hasSubmitted.set(false);
  }
}
