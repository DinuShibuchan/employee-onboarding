import {
  disabled,
  email,
  hidden,
  maxLength,
  minLength,
  pattern,
  required,
  validate,
  validateHttp,
  applyEach,
  SchemaFn,
} from '@angular/forms/signals';
import { Onboarding } from '../models/onboarding.model';

export const onboardingSchema: SchemaFn<Onboarding> = (path) => {
  // VR-1: First name, last name: Required. 2 to 50 characters. Letters and spaces only.
  required(path.firstName, { message: 'First name is required.' });
  minLength(path.firstName, 2, { message: 'First name must be at least 2 characters.' });
  maxLength(path.firstName, 50, { message: 'First name cannot exceed 50 characters.' });
  pattern(path.firstName, /^[a-zA-Z\s]+$/, { message: 'First name can only contain letters and spaces.' });

  required(path.lastName, { message: 'Last name is required.' });
  minLength(path.lastName, 2, { message: 'Last name must be at least 2 characters.' });
  maxLength(path.lastName, 50, { message: 'Last name cannot exceed 50 characters.' });
  pattern(path.lastName, /^[a-zA-Z\s]+$/, { message: 'Last name can only contain letters and spaces.' });

  // VR-2: Email: Required and valid. Must not already exist (async check). Show "Checking..." while it runs.
  required(path.email, { message: 'Email is required.' });
  email(path.email, { message: 'Please enter a valid email address.' });
  validateHttp(path.email, {
    request: (ctx) => {
      const val = (ctx.value() ?? '').trim();
      if (!val || !val.includes('@')) return undefined;
      return `/api/check-email?email=${encodeURIComponent(val)}`;
    },
    onSuccess: (result: { exists?: boolean }) => {
      if (result?.exists) {
        return { kind: 'emailExists', message: 'Email already exists.' };
      }
      return null;
    },
    onError: () => null,
  });

  // VR-3: Phone: 10 digits, starting with 6, 7, 8 or 9.
  required(path.phone, { message: 'Phone number is required.' });
  pattern(path.phone, /^[6-9]\d{9}$/, { message: 'Phone must be 10 digits starting with 6, 7, 8, or 9.' });

  // VR-4: Date of birth: Must be at least 18 years old on the joining date.
  required(path.dateOfBirth, { message: 'Date of birth is required.' });
  validate(path.dateOfBirth, (ctx) => {
    const dob = ctx.value();
    const joiningDate = ctx.valueOf(path.joiningDate);
    if (!dob || !joiningDate) return null;
    const dDob = new Date(dob);
    const dJoin = new Date(joiningDate);
    if (isNaN(dDob.getTime()) || isNaN(dJoin.getTime())) return null;

    let age = dJoin.getFullYear() - dDob.getFullYear();
    const m = dJoin.getMonth() - dDob.getMonth();
    if (m < 0 || (m === 0 && dJoin.getDate() < dDob.getDate())) {
      age--;
    }
    if (age < 18) {
      return { kind: 'minAgeOnJoining', message: 'Must be at least 18 years old on the joining date.' };
    }
    return null;
  });

  // Employment details
  required(path.employmentType, { message: 'Employment type is required.' });
  required(path.department, { message: 'Department is required.' });

  // Designation is disabled when department is empty, and required
  disabled(path.designation, (ctx) => !ctx.valueOf(path.department));
  required(path.designation, { message: 'Designation is required.' });
  required(path.joiningDate, { message: 'Joining date is required.' });

  validate(path.joiningDate, (ctx) => {
    const joiningDate = ctx.value();
    const dob = ctx.valueOf(path.dateOfBirth);
    if (!dob || !joiningDate) return null;
    const dDob = new Date(dob);
    const dJoin = new Date(joiningDate);
    if (isNaN(dDob.getTime()) || isNaN(dJoin.getTime())) return null;

    let age = dJoin.getFullYear() - dDob.getFullYear();
    const m = dJoin.getMonth() - dDob.getMonth();
    if (m < 0 || (m === 0 && dJoin.getDate() < dDob.getDate())) {
      age--;
    }
    if (age < 18) {
      return { kind: 'minAgeOnJoining', message: 'Must be at least 18 years old on the joining date.' };
    }
    return null;
  });

  // VR-5: End date: Shown and required only for Contract and Intern. Must be after the joining date.
  hidden(path.endDate, (ctx) => ctx.valueOf(path.employmentType) === 'Full-time');
  required(path.endDate, {
    when: (ctx) => ctx.valueOf(path.employmentType) !== 'Full-time',
    message: 'End date is required for Contract and Intern positions.',
  });
  validate(path.endDate, (ctx) => {
    const empType = ctx.valueOf(path.employmentType);
    if (empType === 'Full-time') return null;
    const end = ctx.value();
    const join = ctx.valueOf(path.joiningDate);
    if (!end || !join) return null;
    if (new Date(end) <= new Date(join)) {
      return { kind: 'endDateAfterJoining', message: 'End date must be after the joining date.' };
    }
    return null;
  });

  // VR-6: Manager email: Required and valid. Cannot be the same as the employee's email.
  required(path.managerEmail, { message: 'Manager email is required.' });
  email(path.managerEmail, { message: 'Please enter a valid manager email address.' });
  validate(path.managerEmail, (ctx) => {
    const mgr = (ctx.value() ?? '').trim().toLowerCase();
    const emp = (ctx.valueOf(path.email) ?? '').trim().toLowerCase();
    if (mgr && emp && mgr === emp) {
      return { kind: 'managerSameAsEmployee', message: 'Manager email cannot be the same as the employee email.' };
    }
    return null;
  });
  validate(path.email, (ctx) => {
    const emp = (ctx.value() ?? '').trim().toLowerCase();
    const mgr = (ctx.valueOf(path.managerEmail) ?? '').trim().toLowerCase();
    if (emp && mgr && emp === mgr) {
      return { kind: 'managerSameAsEmployee', message: 'Employee email cannot be the same as the manager email.' };
    }
    return null;
  });

  // VR-7: Address: Line 1 and city required. PIN is 6 digits and does not start with 0.
  required(path.address.line1, { message: 'Line 1 is required.' });
  required(path.address.city, { message: 'City is required.' });
  required(path.address.pin, { message: 'PIN code is required.' });
  pattern(path.address.pin, /^[1-9]\d{5}$/, { message: 'PIN must be 6 digits and not start with 0.' });

  // VR-8: Skills: 2 to 6 skills. Names required and unique (not case-sensitive). Rating required.
  validate(path.skills, (ctx) => {
    const skills = ctx.value() || [];
    if (skills.length < 2) {
      return { kind: 'minSkills', message: 'At least 2 skills are required.' };
    }
    if (skills.length > 6) {
      return { kind: 'maxSkills', message: 'Maximum of 6 skills allowed.' };
    }
    return null;
  });

  applyEach(path.skills, (skill) => {
    required(skill.name, { message: 'Skill name is required.' });
    validate(skill.name, (ctx) => {
      const name = (ctx.value() ?? '').trim().toLowerCase();
      if (!name) return null;
      const allSkills = ctx.valueOf(path.skills) || [];
      const occurrences = allSkills.filter(
        (s) => (s.name ?? '').trim().toLowerCase() === name
      ).length;
      if (occurrences > 1) {
        return { kind: 'uniqueSkillName', message: 'Skill names must be unique (not case-sensitive).' };
      }
      return null;
    });

    validate(skill.rating, (ctx) => {
      const rating = ctx.value();
      if (!rating || rating < 1) {
        return { kind: 'ratingRequired', message: 'Rating is required (at least 1 star).' };
      }
      return null;
    });
  });
};
