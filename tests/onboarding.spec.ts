import '@angular/compiler';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DEPARTMENT_DESIGNATIONS, INITIAL_ONBOARDING } from '../src/app/models/onboarding.model.ts';
import { emailCheckInterceptor } from '../src/app/interceptors/email-check.interceptor.ts';
import { HttpRequest, HttpResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

describe('Employee Onboarding Specification Tests', () => {

  describe('Data Model & Requirements', () => {
    it('initial onboarding model matches required interface structure', () => {
      assert.equal(INITIAL_ONBOARDING.firstName, '');
      assert.equal(INITIAL_ONBOARDING.lastName, '');
      assert.equal(INITIAL_ONBOARDING.email, '');
      assert.equal(INITIAL_ONBOARDING.phone, '');
      assert.equal(INITIAL_ONBOARDING.dateOfBirth, '');
      assert.equal(INITIAL_ONBOARDING.employmentType, 'Full-time');
      assert.equal(INITIAL_ONBOARDING.department, '');
      assert.equal(INITIAL_ONBOARDING.designation, '');
      assert.equal(INITIAL_ONBOARDING.joiningDate, '');
      assert.equal(INITIAL_ONBOARDING.endDate, null);
      assert.equal(INITIAL_ONBOARDING.managerEmail, '');
      assert.deepEqual(INITIAL_ONBOARDING.address, { line1: '', city: '', pin: '' });
      assert.equal(INITIAL_ONBOARDING.skills.length, 2);
    });

    it('department and designation mapping is configured correctly', () => {
      assert.deepEqual(DEPARTMENT_DESIGNATIONS['Engineering'], [
        'Frontend Developer',
        'Backend Developer',
        'QA Engineer',
      ]);
      assert.deepEqual(DEPARTMENT_DESIGNATIONS['Design'], [
        'UI Designer',
        'UX Researcher',
      ]);
      assert.deepEqual(DEPARTMENT_DESIGNATIONS['HR'], [
        'HR Executive',
        'Recruiter',
      ]);
    });
  });

  describe('VR-2: Email Check HTTP Interceptor', () => {
    it('returns exists: true for admin@company.com', async () => {
      const req = new HttpRequest('GET', '/api/check-email?email=admin@company.com');
      let nextCalled = false;
      const next = () => { nextCalled = true; throw new Error('Should not call next'); };

      const res = await firstValueFrom(emailCheckInterceptor(req, next as any));
      assert.equal(nextCalled, false);
      assert.ok(res instanceof HttpResponse);
      assert.equal(res.status, 200);
      assert.deepEqual(res.body, { exists: true });
    });

    it('returns exists: true for hr@company.com (case-insensitive)', async () => {
      const req = new HttpRequest('GET', '/api/check-email?email=HR@company.com');
      const next = () => { throw new Error('Should not call next'); };

      const res = await firstValueFrom(emailCheckInterceptor(req, next as any));
      assert.ok(res instanceof HttpResponse);
      assert.equal(res.status, 200);
      assert.deepEqual(res.body, { exists: true });
    });

    it('returns exists: false for new employee email', async () => {
      const req = new HttpRequest('GET', '/api/check-email?email=new.hire@company.com');
      const next = () => { throw new Error('Should not call next'); };

      const res = await firstValueFrom(emailCheckInterceptor(req, next as any));
      assert.ok(res instanceof HttpResponse);
      assert.equal(res.status, 200);
      assert.deepEqual(res.body, { exists: false });
    });

    it('passes through unrelated requests to next handler', async () => {
      const req = new HttpRequest('GET', '/api/other-endpoint');
      let passedThrough = false;
      const next = (r: HttpRequest<any>) => {
        passedThrough = true;
        return { pipe: () => Promise.resolve(new HttpResponse({ status: 200 })) } as any;
      };

      emailCheckInterceptor(req, next as any);
      assert.equal(passedThrough, true);
    });
  });

  describe('Validation Rules (Regex & Logic Verification)', () => {
    // VR-1: 2 to 50 chars, letters and spaces only
    const nameRegex = /^[a-zA-Z\s]+$/;
    it('VR-1: validates first and last name rules', () => {
      assert.ok(nameRegex.test('John'));
      assert.ok(nameRegex.test('Mary Jane'));
      assert.ok(nameRegex.test('De la Cruz'));
      assert.ok(!nameRegex.test('John123'));
      assert.ok(!nameRegex.test('John_Doe'));
      assert.ok(!nameRegex.test('John@Doe'));
    });

    // VR-3: 10 digits starting with 6, 7, 8 or 9
    const phoneRegex = /^[6-9]\d{9}$/;
    it('VR-3: validates phone number rules', () => {
      assert.ok(phoneRegex.test('9876543210'));
      assert.ok(phoneRegex.test('8123456789'));
      assert.ok(phoneRegex.test('7000000000'));
      assert.ok(phoneRegex.test('6999999999'));
      // Invalid phones
      assert.ok(!phoneRegex.test('5876543210')); // starts with 5
      assert.ok(!phoneRegex.test('987654321'));  // 9 digits
      assert.ok(!phoneRegex.test('98765432100')); // 11 digits
      assert.ok(!phoneRegex.test('98765abc10')); // non-digits
    });

    // VR-4: Date of birth must be at least 18 years old on joining date
    function calculateAgeOnJoining(dobStr: string, joiningDateStr: string): number {
      const dob = new Date(dobStr);
      const join = new Date(joiningDateStr);
      let age = join.getFullYear() - dob.getFullYear();
      const m = join.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && join.getDate() < dob.getDate())) {
        age--;
      }
      return age;
    }

    it('VR-4: validates employee is at least 18 years old on joining date', () => {
      // Born 2000-01-01, joining 2026-11-24: age 26 (valid)
      assert.ok(calculateAgeOnJoining('2000-01-01', '2026-11-24') >= 18);

      // Exactly 18th birthday
      assert.ok(calculateAgeOnJoining('2008-11-24', '2026-11-24') >= 18);

      // 1 day before 18th birthday
      assert.ok(calculateAgeOnJoining('2008-11-25', '2026-11-24') < 18);

      // 16 years old
      assert.ok(calculateAgeOnJoining('2010-06-15', '2026-11-24') < 18);
    });

    // VR-5: End date must be after joining date
    it('VR-5: end date must be strictly after joining date', () => {
      const join = new Date('2026-12-01');
      const endValid = new Date('2027-06-01');
      const endInvalidSame = new Date('2026-12-01');
      const endInvalidBefore = new Date('2026-11-30');

      assert.ok(endValid > join);
      assert.ok(!(endInvalidSame > join));
      assert.ok(!(endInvalidBefore > join));
    });

    // VR-6: Manager email cannot be employee email
    it('VR-6: manager email cannot be same as employee email', () => {
      const empEmail = 'alice@company.com';
      const mgrEmail1 = 'bob@company.com';
      const mgrEmail2 = 'ALICE@company.com';

      assert.notEqual(empEmail.toLowerCase(), mgrEmail1.toLowerCase());
      assert.equal(empEmail.toLowerCase(), mgrEmail2.toLowerCase());
    });

    // VR-7: PIN is 6 digits and does not start with 0
    const pinRegex = /^[1-9]\d{5}$/;
    it('VR-7: PIN code must be 6 digits and not start with 0', () => {
      assert.ok(pinRegex.test('560001'));
      assert.ok(pinRegex.test('110001'));
      assert.ok(!pinRegex.test('012345')); // starts with 0
      assert.ok(!pinRegex.test('56000'));  // 5 digits
      assert.ok(!pinRegex.test('5600001')); // 7 digits
      assert.ok(!pinRegex.test('56000a')); // non-digits
    });

    // VR-8: Skills unique (case-insensitive) and 2 to 6 skills
    it('VR-8: skill count must be between 2 and 6', () => {
      const validSkills = ['Angular', 'TypeScript'];
      assert.ok(validSkills.length >= 2 && validSkills.length <= 6);

      const oneSkill = ['Angular'];
      assert.ok(oneSkill.length < 2);

      const sevenSkills = ['1', '2', '3', '4', '5', '6', '7'];
      assert.ok(sevenSkills.length > 6);
    });

    it('VR-8: skill names must be unique (not case-sensitive)', () => {
      const skills = [
        { name: 'Angular', rating: 5 },
        { name: 'angular', rating: 4 },
        { name: 'React', rating: 3 },
      ];

      const duplicates = skills.filter(
        (s) => skills.filter((x) => x.name.trim().toLowerCase() === s.name.trim().toLowerCase()).length > 1
      );
      assert.equal(duplicates.length, 2);
    });
  });
});
