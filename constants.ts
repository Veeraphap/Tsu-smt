
import { Course, FacultyMap, CreditRequirement } from './types';

export const FACULTIES: FacultyMap = {
  "วิทยาศาสตร์": ["วิทยาการคอมพิวเตอร์", "เทคโนโลยีสารสนเทศ", "คณิตศาสตร์"],
  "นิติศาสตร์": ["นิติศาสตร์"],
  "ศึกษาศาสตร์": ["เอกอังกฤษ", "เอกสังคม", "เอกพลศึกษา", "เอกไทย", "เอกวิทยาศาสตร์ทั่วไป"],
  "บริหารธุรกิจ": ["การบัญชี", "การตลาด", "การจัดการ"],
  "มนุษยศาสตร์": ["ภาษาอังกฤษ", "ภาษาไทย", "ประวัติศาสตร์"]
};

export const CREDIT_REQUIREMENTS: CreditRequirement = {
  "ปี 1": 42,
  "ปี 2": 42,
  "ปี 3": 42,
  "ปี 4": 30,
};

const mockReviews = [
  { id: '1', reviewer: 'รุ่นพี่ปี 3', difficulty: 'ง่าย' as const, rating: 5, comment: 'เนื้อหาสนุกมาก อาจารย์ใจดี เกรดเอได้ไม่ยากถ้าส่งงานครบ', timestamp: Date.now() },
  { id: '2', reviewer: 'รุ่นพี่ปี 2', difficulty: 'ปานกลาง' as const, rating: 4, comment: 'ข้อสอบไม่ยากเท่าในชีท แนะนำให้เข้าเรียนทุกครั้ง', timestamp: Date.now() - 86400000 }
];

const mockStats = { A: 25, B_plus: 20, B: 30, C_plus: 15, C: 5, D_plus: 3, D: 2, F: 0 };

export const COURSES_DATA: Course[] = [
  // --- หมวดศึกษาทั่วไป (ทุกคณะ/ทุกสาขา) ---
  { code: "GE101", name: "ภาษาไทยเพื่อการสื่อสาร", credits: 3, cat: "ศึกษาทั่วไป", faculty: "ทุกคณะ", major: "ทุกสาขา", time: "09:00-12:00", day: "จันทร์", year: 1, maxSeats: 100 },
  { code: "GE102", name: "ภาษาอังกฤษพื้นฐาน 1", credits: 3, cat: "ศึกษาทั่วไป", faculty: "ทุกคณะ", major: "ทุกสาขา", time: "09:00-12:00", day: "อังคาร", year: 1, maxSeats: 100 },
  { code: "GE103", name: "พลศึกษาและนันทนาการ", credits: 1, cat: "ศึกษาทั่วไป", faculty: "ทุกคณะ", major: "ทุกสาขา", time: "16:00-18:00", day: "พุธ", year: 1, maxSeats: 50 },
  { code: "GE104", name: "เทคโนโลยีดิจิทัลเพื่ออนาคต", credits: 3, cat: "ศึกษาทั่วไป", faculty: "ทุกคณะ", major: "ทุกสาขา", time: "13:00-16:00", day: "พฤหัสบดี", year: 1, maxSeats: 80 },
  { code: "GE105", name: "พลเมืองและการมีส่วนร่วม", credits: 3, cat: "ศึกษาทั่วไป", faculty: "ทุกคณะ", major: "ทุกสาขา", time: "09:00-12:00", day: "ศุกร์", year: 1, maxSeats: 80 },

  // --- คณะวิทยาศาสตร์ ---
  { code: "SC101", name: "ปฏิบัติการวิทยาศาสตร์พื้นฐาน", credits: 1, cat: "เสริมบังคับ", faculty: "วิทยาศาสตร์", major: "ทุกสาขา", time: "13:00-16:00", day: "จันทร์", year: 1, maxSeats: 40 },
  { code: "SC102", name: "คณิตศาสตร์พื้นฐานสำหรับวิทยาศาสตร์", credits: 3, cat: "เสริมบังคับ", faculty: "วิทยาศาสตร์", major: "ทุกสาขา", time: "09:00-12:00", day: "พุธ", year: 1, maxSeats: 60 },
  
  // วิชาเอก: วิทยาการคอมพิวเตอร์
  { code: "CS111", name: "การเขียนโปรแกรมคอมพิวเตอร์ 1", credits: 4, cat: "วิชาเอก", faculty: "วิทยาศาสตร์", major: "วิทยาการคอมพิวเตอร์", time: "13:00-17:00", day: "อังคาร", year: 1, maxSeats: 40 },
  { code: "CS112", name: "ระบบคอมพิวเตอร์และสถาปัตยกรรม", credits: 3, cat: "วิชาเอก", faculty: "วิทยาศาสตร์", major: "วิทยาการคอมพิวเตอร์", time: "09:00-12:00", day: "พฤหัสบดี", year: 1, maxSeats: 40 },
  { code: "CS113", name: "คณิตศาสตร์ไม่ต่อเนื่อง", credits: 3, cat: "วิชาเอก", faculty: "วิทยาศาสตร์", major: "วิทยาการคอมพิวเตอร์", time: "13:00-16:00", day: "ศุกร์", year: 1, maxSeats: 40 },

  // วิชาเอก: เทคโนโลยีสารสนเทศ
  { code: "IT111", name: "พื้นฐานระบบสารสนเทศ", credits: 3, cat: "วิชาเอก", faculty: "วิทยาศาสตร์", major: "เทคโนโลยีสารสนเทศ", time: "09:00-12:00", day: "อังคาร", year: 1, maxSeats: 40 },
  { code: "IT112", name: "การออกแบบเว็บเบื้องต้น", credits: 3, cat: "วิชาเอก", faculty: "วิทยาศาสตร์", major: "เทคโนโลยีสารสนเทศ", time: "13:00-16:00", day: "พฤหัสบดี", year: 1, maxSeats: 40 },
  { code: "IT113", name: "เทคโนโลยีการสื่อสารข้อมูล", credits: 3, cat: "วิชาเอก", faculty: "วิทยาศาสตร์", major: "เทคโนโลยีสารสนเทศ", time: "13:00-16:00", day: "ศุกร์", year: 1, maxSeats: 40 },

  // วิชาเอก: คณิตศาสตร์
  { code: "MA111", name: "แคลคูลัส 1", credits: 3, cat: "วิชาเอก", faculty: "วิทยาศาสตร์", major: "คณิตศาสตร์", time: "09:00-12:00", day: "อังคาร", year: 1, maxSeats: 40 },
  { code: "MA112", name: "พีชคณิตเชิงเส้น", credits: 3, cat: "วิชาเอก", faculty: "วิทยาศาสตร์", major: "คณิตศาสตร์", time: "13:00-16:00", day: "พฤหัสบดี", year: 1, maxSeats: 40 },
  { code: "MA113", name: "ตรรกศาสตร์เบื้องต้น", credits: 3, cat: "วิชาเอก", faculty: "วิทยาศาสตร์", major: "คณิตศาสตร์", time: "09:00-12:00", day: "ศุกร์", year: 1, maxSeats: 40 },

  // --- คณะนิติศาสตร์ ---
  { code: "LAW100", name: "ความรู้พื้นฐานเกี่ยวกับกฎหมาย", credits: 3, cat: "เสริมบังคับ", faculty: "นิติศาสตร์", major: "นิติศาสตร์", time: "13:00-16:00", day: "พุธ", year: 1, maxSeats: 80 },
  { code: "LAW111", name: "กฎหมายลักษณะนิติกรรมและสัญญา", credits: 3, cat: "วิชาเอก", faculty: "นิติศาสตร์", major: "นิติศาสตร์", time: "09:00-12:00", day: "จันทร์", year: 1, maxSeats: 60 },
  { code: "LAW112", name: "กฎหมายลักษณะบุคคล", credits: 3, cat: "วิชาเอก", faculty: "นิติศาสตร์", major: "นิติศาสตร์", time: "13:00-16:00", day: "อังคาร", year: 1, maxSeats: 60 },
  { code: "LAW113", name: "กฎหมายอาญา ภาคบทบัญญัติทั่วไป", credits: 3, cat: "วิชาเอก", faculty: "นิติศาสตร์", major: "นิติศาสตร์", time: "09:00-12:00", day: "พฤหัสบดี", year: 1, maxSeats: 60 },

  // --- คณะศึกษาศาสตร์ ---
  { code: "ED201", name: "ความเป็นครูและปรัชญาการศึกษา", credits: 3, cat: "เสริมบังคับ", faculty: "ศึกษาศาสตร์", major: "ทุกสาขา", time: "09:00-12:00", day: "จันทร์", year: 1, maxSeats: 150 },
  { code: "ED202", name: "จิตวิทยาสำหรับครู", credits: 3, cat: "เสริมบังคับ", faculty: "ศึกษาศาสตร์", major: "ทุกสาขา", time: "13:00-16:00", day: "อังคาร", year: 1, maxSeats: 150 },
  { code: "EDE111", name: "ทักษะการฟังและพูดภาษาอังกฤษ", credits: 3, cat: "วิชาเอก", faculty: "ศึกษาศาสตร์", major: "เอกอังกฤษ", time: "09:00-12:00", day: "พุธ", year: 1, maxSeats: 40 },
  { code: "EDS111", name: "พื้นฐานทางสังคมวิทยา", credits: 3, cat: "วิชาเอก", faculty: "ศึกษาศาสตร์", major: "เอกสังคม", time: "09:00-12:00", day: "พุธ", year: 1, maxSeats: 40 },
  { code: "EDP111", name: "สรีรวิทยาการออกกำลังกาย", credits: 3, cat: "วิชาเอก", faculty: "ศึกษาศาสตร์", major: "เอกพลศึกษา", time: "09:00-12:00", day: "พุธ", year: 1, maxSeats: 40 },
  { code: "EDT111", name: "ลักษณะภาษาไทย", credits: 3, cat: "วิชาเอก", faculty: "ศึกษาศาสตร์", major: "เอกไทย", time: "09:00-12:00", day: "พุธ", year: 1, maxSeats: 40 },
  { code: "EDV111", name: "ชีววิทยาเบื้องต้นสำหรับครู", credits: 3, cat: "วิชาเอก", faculty: "ศึกษาศาสตร์", major: "เอกวิทยาศาสตร์ทั่วไป", time: "09:00-12:00", day: "พุธ", year: 1, maxSeats: 40 },

  // --- คณะบริหารธุรกิจ ---
  { code: "BA101", name: "ธุรกิจเบื้องต้น", credits: 3, cat: "เสริมบังคับ", faculty: "บริหารธุรกิจ", major: "ทุกสาขา", time: "13:00-16:00", day: "พุธ", year: 1, maxSeats: 120 },
  { code: "BA102", name: "หลักเศรษฐศาสตร์จุลภาค", credits: 3, cat: "เสริมบังคับ", faculty: "บริหารธุรกิจ", major: "ทุกสาขา", time: "09:00-12:00", day: "พฤหัสบดี", year: 1, maxSeats: 120 },
  { code: "ACC111", name: "การบัญชีขั้นต้น 1", credits: 3, cat: "วิชาเอก", faculty: "บริหารธุรกิจ", major: "การบัญชี", time: "09:00-12:00", day: "จันทร์", year: 1, maxSeats: 50 },
  { code: "MKT111", name: "หลักการตลาด", credits: 3, cat: "วิชาเอก", faculty: "บริหารธุรกิจ", major: "การตลาด", time: "09:00-12:00", day: "จันทร์", year: 1, maxSeats: 50 },
  { code: "MGT111", name: "หลักการจัดการ", credits: 3, cat: "วิชาเอก", faculty: "บริหารธุรกิจ", major: "การจัดการ", time: "09:00-12:00", day: "จันทร์", year: 1, maxSeats: 50 },

  // --- คณะมนุษยศาสตร์ ---
  { code: "HM101", name: "อารยธรรมตะวันตกและตะวันออก", credits: 3, cat: "เสริมบังคับ", faculty: "มนุษยศาสตร์", major: "ทุกสาขา", time: "09:00-12:00", day: "จันทร์", year: 1, maxSeats: 100 },
  { code: "ENG111", name: "โครงสร้างภาษาอังกฤษ", credits: 3, cat: "วิชาเอก", faculty: "มนุษยศาสตร์", major: "ภาษาอังกฤษ", time: "09:00-12:00", day: "พุธ", year: 1, maxSeats: 40 },
  { code: "THA111", name: "ประวัติวรรณคดีไทย", credits: 3, cat: "วิชาเอก", faculty: "มนุษยศาสตร์", major: "ภาษาไทย", time: "09:00-12:00", day: "พุธ", year: 1, maxSeats: 40 },
  { code: "HIS111", name: "วิธีการทางประวัติศาสตร์", credits: 3, cat: "วิชาเอก", faculty: "มนุษยศาสตร์", major: "ประวัติศาสตร์", time: "09:00-12:00", day: "พุธ", year: 1, maxSeats: 40 },

  // --- วิชาเลือกเสรี ---
  { code: "FE201", name: "ภาษาเกาหลีเพื่อการสื่อสาร", credits: 3, cat: "วิชาเลือกเสรี", faculty: "ทุกคณะ", major: "ทุกสาขา", time: "16:00-19:00", day: "จันทร์", year: 1, maxSeats: 40 },
  { code: "FE202", name: "ศิลปะการถ่ายภาพดิจิทัล", credits: 3, cat: "วิชาเลือกเสรี", faculty: "ทุกคณะ", major: "ทุกสาขา", time: "16:00-19:00", day: "อังคาร", year: 1, maxSeats: 30 },
];