# Employee Onboarding (Angular Signal Forms)

An Employee Onboarding application built with **Angular Signal Forms** (`@angular/forms/signals`), demonstrating model signals, reactive form schemas, custom form controls, and validation rules.

---

## Features

- **Angular Signal Forms (`@angular/forms/signals`)**:
  - Direct binding using `[formField]` and `[formRoot]`.
  - Zero usage of legacy `FormBuilder`, `FormGroup`, or `ngModel`.
- **Four Form Sections**:
  1. **Personal Information**: First Name, Last Name, Email, Phone, Date of Birth.
  2. **Employment Details**: Employment Type, Department, Designation, Joining Date, End Date, Manager Email.
  3. **Residential Address**: Address Line 1, City, PIN Code.
  4. **Technical Skills**: Dynamic list (2 to 6 skills) with ratings.
- **Reusable StarRating Component**:
  - Implements `FormValueControl<number>` using `model<number>(0)` and `model<boolean>(false)`.
  - Integrates with `[formField]` without `ControlValueAccessor`.
- **Validation Rules (VR-1 to VR-8)**:
  - **VR-1**: First and last name required, 2 to 50 characters, letters and spaces only.
  - **VR-2**: Email required, valid format, async uniqueness check via Fake API HTTP interceptor (`GET /api/check-email`) with 800 ms delay and `"Checking..."` state.
  - **VR-3**: Phone required, exactly 10 digits starting with 6, 7, 8, or 9.
  - **VR-4**: Date of birth required, must be at least 18 years old on joining date.
  - **VR-5**: End date required and visible only for Contract and Intern positions; must be after joining date.
  - **VR-6**: Manager email required and valid; cannot match employee's email.
  - **VR-7**: Address line 1 & city required; PIN code required, 6 digits, cannot start with 0.
  - **VR-8**: 2 to 6 skills required; skill names required and unique (case-insensitive); rating required (1–5).
- **Rule-Driven Errors**:
  - Error messages defined directly in the schema, appearing only after a field is touched or when submit is attempted.
- **Submit & Reset**:
  - Submit button enabled only when the entire form is valid and no check is running.
  - Shows success notification with the employee's full name and resets the form.

---

## Getting Started

### Prerequisites
- Node.js (v22+)
- npm

### Installation
```bash
npm install
```

### Development Server
```bash
npm start
```
Navigate to `http://localhost:4200/`.

### Run Tests
```bash
npm test
```

### Production Build
```bash
npm run build
```
Build output is generated in `dist/employee-onboarding`.
