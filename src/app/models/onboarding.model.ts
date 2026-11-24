export interface Address {
  line1: string;
  city: string;
  pin: string;
}

export interface Skill {
  name: string;
  rating: number;
}

export type EmploymentType = 'Full-time' | 'Contract' | 'Intern';

export interface Onboarding {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  employmentType: EmploymentType;
  department: string;
  designation: string;
  joiningDate: string;
  endDate: string | null;
  managerEmail: string;
  address: Address;
  skills: Skill[];
}

export const INITIAL_ONBOARDING: Onboarding = {
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
  address: {
    line1: '',
    city: '',
    pin: '',
  },
  skills: [
    { name: '', rating: 0 },
    { name: '', rating: 0 },
  ],
};

export const DEPARTMENT_DESIGNATIONS: Record<string, string[]> = {
  Engineering: ['Frontend Developer', 'Backend Developer', 'QA Engineer'],
  Design: ['UI Designer', 'UX Researcher'],
  HR: ['HR Executive', 'Recruiter'],
};
