
export interface Review {
  id: string;
  reviewer: string;
  difficulty: 'ง่าย' | 'ปานกลาง' | 'ยาก';
  rating: number; // 1-5
  comment: string;
  timestamp: number;
}

export interface GradeStats {
  A: number;
  B_plus: number;
  B: number;
  C_plus: number;
  C: number;
  D_plus: number;
  D: number;
  F: number;
}

export interface Course {
  code: string;
  name: string;
  credits: number;
  cat: 'ศึกษาทั่วไป' | 'วิชาเอก' | 'เสริมบังคับ' | 'วิชาเลือกเสรี';
  faculty: string;
  major: string;
  time: string;
  year: number;
  day: string;
  maxSeats: number;
  reviews?: Review[];
  gradeStats?: GradeStats;
}

export interface User {
  id: string;
  password?: string;
  firstName: string;
  lastName: string;
  faculty: string;
  major: string;
  advisorName?: string;
  schedule: Course[];
  profileImage?: string;
  isEnrolled?: boolean;
}

export interface Report {
  id: string;
  userId: string;
  userName: string;
  subject: 'ชื่อ-นามสกุลผิด' | 'คณะ/สาขาผิด' | 'รหัสนิสิตผิด' | 'ลงวิชาเรียนผิด/ขอแก้ไข' | 'ปัญหาอื่นๆ';
  detail: string;
  timestamp: number;
  resolvedAt?: number;
  resolvedBy?: string;
  status: 'pending' | 'resolved';
}

export interface FacultyMap {
  [key: string]: string[];
}

export interface CreditRequirement {
  [key: string]: number;
}