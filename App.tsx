
import React, { useState, useEffect, useRef } from 'react';
import { User, Course } from './types';
import { FACULTIES, COURSES_DATA } from './constants';
import { getConflictingCourse } from './utils';
import { getSmartAdviceStream } from './geminiService'; DAYS = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'];
const TIME_SLOTS = Array.from({ length: 11 }, (_, i) => i + 8);

const StatusBadge: React.FC<{ type: string }> = ({ type }) => {
  const colors: Record<string, string> = {
    'ศึกษาทั่วไป': 'bg-orange-100 text-orange-600',
    'วิชาเอก': 'bg-blue-100 text-blue-600',
    'วิชาเลือกเสรี': 'bg-emerald-100 text-emerald-600',
    'เสริมบังคับ': 'bg-purple-100 text-purple-600'
  };
  return (
    <span className={`text-[9px] font-black px-2.5 py-1 rounded-full ${colors[type] || 'bg-slate-100 text-slate-600'}`}>
      {type}
    </span>
  );
};

const WeeklyTimetable: React.FC<{ schedule: Course[] }> = ({ schedule }) => {
  const SLOT_HEIGHT = 56;

  return (
    <div className="w-full bg-white rounded-[32px] border border-slate-100 shadow-lg shadow-slate-200/40 overflow-hidden">
      <div className="overflow-x-auto p-3 md:p-6">
        <div className="min-w-[700px] relative">
          <div className="grid grid-cols-6 gap-2 mb-4">
            <div className="w-16"></div>
            {DAYS.slice(0, 5).map(day => (
              <div key={day} className="flex flex-col items-center justify-center py-2.5 bg-slate-50 rounded-xl">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{day === 'พฤหัสบดี' ? 'พฤหัส' : day}</span>
              </div>
            ))}
          </div>

          <div className="relative">
            {TIME_SLOTS.map((hour, idx) => (
              <div key={hour} className={`flex items-start`} style={{ height: `${SLOT_HEIGHT}px` }}>
                <div className="w-16 -mt-2.5 pr-4 text-right">
                  <span className="text-[10px] font-black text-slate-300 tabular-nums">{String(hour).padStart(2, '0')}:00</span>
                </div>
                <div className={`flex-1 grid grid-cols-5 gap-2 h-full ${idx !== TIME_SLOTS.length - 1 ? 'border-t border-slate-50' : ''}`}>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="border-l border-slate-50/30 h-full"></div>
                  ))}
                </div>
              </div>
            ))}

            <div className="absolute top-0 left-16 right-0 bottom-0 pointer-events-none">
              <div className="grid grid-cols-5 gap-2 h-full">
                {schedule.map((course, idx) => {
                  const dayIdx = DAYS.indexOf(course.day);
                  if (dayIdx > 4 || dayIdx === -1) return null;
                  
                  const [start, end] = course.time.split('-').map(t => {
                    const [h, m] = t.split(':').map(Number);
                    return h + m / 60;
                  });
                  
                  const top = (start - 8) * SLOT_HEIGHT;
                  const height = (end - start) * SLOT_HEIGHT;
                  
                  const categoryStyles: Record<string, string> = {
                    'ศึกษาทั่วไป': 'bg-orange-50 border-orange-200 text-orange-700',
                    'วิชาเอก': 'bg-blue-50 border-blue-200 text-blue-700',
                    'วิชาเลือกเสรี': 'bg-emerald-50 border-emerald-200 text-emerald-700',
                    'เสริมบังคับ': 'bg-purple-50 border-purple-200 text-purple-700'
                  };

                  return (
                    <div
                      key={course.code + idx}
                      className="relative h-full pointer-events-auto group"
                      style={{ gridColumnStart: dayIdx + 1 }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          top: `${top}px`,
                          height: `${height - 2}px`,
                          width: '100%',
                        }}
                        className={`rounded-xl border-l-[3px] p-2 shadow-sm transition-all hover:brightness-95 animate-in fade-in zoom-in duration-300 ${categoryStyles[course.cat] || 'bg-slate-50 border-slate-200 text-slate-700'}`}
                      >
                        <div className="flex flex-col h-full overflow-hidden">
                          <p className="text-[8px] font-black opacity-60 uppercase tracking-tighter mb-0.5 leading-none">{course.code}</p>
                          <p className="text-[10px] font-black leading-tight line-clamp-2">{course.name}</p>
                          <div className="mt-auto flex items-center justify-between">
                            <span className="text-[8px] font-bold opacity-70">{course.time}</span>
                            <div className={`w-1 h-1 rounded-full ${course.cat === 'วิชาเอก' ? 'bg-blue-600' : 'bg-slate-400'}`}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [db, setDb] = useState<Record<string, User>>(() => {
    const saved = localStorage.getItem('tsu_users');
    return saved ? JSON.parse(saved) : {};
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [activeBottomTab, setActiveBottomTab] = useState<'major' | 'compulsory' | 'general' | 'schedule'>('major');
  const [sidebarView, setSidebarView] = useState<'home' | 'profile' | 'how-to' | 'ai-advice' | 'admin'>('home');
  const [adminSubView, setAdminSubView] = useState<'users'>('users');
  
  const [authForm, setAuthForm] = useState({ id: '', password: '', firstName: '', lastName: '', faculty: '', major: '', advisorName: '' });
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [conflictAlert, setConflictAlert] = useState<{ course: Course, conflict: Course } | null>(null);
  const [showEnrollConfirm, setShowEnrollConfirm] = useState(false);

  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [originalEditId, setOriginalEditId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('tsu_users', JSON.stringify(db));
  }, [db]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (authForm.id === 'Admin' && authForm.password === '221049') {
      setIsAdmin(true);
      setIsLoggedIn(true);
      setSidebarView('admin');
      return;
    }
    if (isRegistering) {
      if (db[authForm.id]) { alert('รหัสนิสิตนี้มีในระบบแล้ว'); return; }
      const newUser: User = { ...authForm, schedule: [], isEnrolled: false };
      setDb(prev => ({ ...prev, [authForm.id]: newUser }));
      setCurrentUser(newUser);
      setIsLoggedIn(true);
    } else {
      const user = db[authForm.id];
      if (user && user.password === authForm.password) {
        setCurrentUser(user);
        setIsLoggedIn(true);
      } else alert('รหัสนิสิตหรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  const deleteUser = (id: string) => {
    if (window.confirm(`ยืนยันการลบรายชื่อนิสิตรหัส ${id}? ข้อมูลจะถูกลบถาวร`)) {
      setDb(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      if (currentUser?.id === id) {
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    }
  };

  const startEditing = (user: User) => {
    setEditingUser({ ...user });
    setOriginalEditId(user.id);
  };

  const handleAdminUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !originalEditId) return;

    if (editingUser.id !== originalEditId && db[editingUser.id]) {
      alert('รหัสนิสิตใหม่นี้มีในระบบแล้ว ไม่สามารถเปลี่ยนได้');
      return;
    }

    setDb(prev => {
      const next = { ...prev };
      if (editingUser.id !== originalEditId) {
        delete next[originalEditId];
      }
      next[editingUser.id] = editingUser;
      return next;
    });

    if (currentUser?.id === originalEditId) {
      setCurrentUser(editingUser);
    }
    
    setEditingUser(null);
    setOriginalEditId(null);
    alert('อัปเดตข้อมูลนิสิตสำเร็จ');
  };

  const toggleCourse = (course: Course) => {
    if (!currentUser) return;
    if (currentUser.isEnrolled) {
      alert("ไม่สามารถแก้ไขได้เนื่องจากยืนยันการลงทะเบียนแล้ว");
      return;
    }
    const isAdded = currentUser.schedule.some(c => c.code === course.code);
    const updatedSchedule = isAdded 
      ? currentUser.schedule.filter(c => c.code !== course.code)
      : [...currentUser.schedule, course];
    
    if (!isAdded) {
      const conflict = getConflictingCourse(course, currentUser.schedule);
      if (conflict) { setConflictAlert({ course, conflict }); return; }
    }

    const updatedUser = { ...currentUser, schedule: updatedSchedule };
    setCurrentUser(updatedUser);
    setDb(prev => ({ ...prev, [currentUser.id]: updatedUser }));
  };

  const handleFinalEnroll = () => {
    if (!currentUser) return;
    const updated = { ...currentUser, isEnrolled: true };
    setCurrentUser(updated);
    setDb(prev => ({ ...prev, [currentUser.id]: updated }));
    setShowEnrollConfirm(false);
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>, targetUser: User | null, setTarget: (u: User) => void) => {
    const file = e.target.files?.[0];
    if (file && targetUser) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const updated = { ...targetUser, profileImage: reader.result as string };
            setTarget(updated);
            if (!isAdmin) {
                setDb(prev => ({ ...prev, [targetUser.id]: updated }));
                setCurrentUser(updated);
            }
        };
        reader.readAsDataURL(file);
    }
  };

  const fetchAiAdvice = async () => {
    if (!currentUser) return;
    setIsAiLoading(true);
    setAiAdvice(""); // ล้างข้อความเก่าก่อนเริ่มสตรีม
    
    const available = COURSES_DATA.filter(c => 
      (c.faculty === 'ทุกคณะ' || c.faculty === currentUser.faculty) &&
      (c.major === 'ทุกสาขา' || c.major === currentUser.major)
    );

    await getSmartAdviceStream(currentUser, available, (updatedText) => {
      setAiAdvice(updatedText);
      // เมื่อเริ่มมีข้อความเข้ามาแล้ว ให้ปิด loading state เพื่อให้เห็น text
      if (updatedText.length > 0) setIsAiLoading(false);
    });
  };

  const getVisibleCourses = () => {
    if (!currentUser) return [];

    const filtered = COURSES_DATA.filter(c => {
      const facultyMatch = c.faculty === 'ทุกคณะ' || c.faculty === currentUser.faculty;
      const majorMatch = c.major === 'ทุกสาขา' || c.major === currentUser.major;
      return facultyMatch && majorMatch;
    });

    if (activeBottomTab === 'major') return filtered.filter(c => c.cat === 'วิชาเอก');
    if (activeBottomTab === 'compulsory') return filtered.filter(c => c.cat === 'เสริมบังคับ');
    if (activeBottomTab === 'general') return filtered.filter(c => c.cat === 'ศึกษาทั่วไป' || c.cat === 'วิชาเลือกเสรี');
    return [];
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-['Kanit']">
        <div className="w-full max-w-md bg-white rounded-[40px] p-10 shadow-2xl animate-in zoom-in duration-500">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-blue-200 mb-4">
              <i className="fa-solid fa-graduation-cap text-3xl text-white"></i>
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">TSU Smart Guide</h1>
            <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mt-1">
              {isRegistering ? 'ลงทะเบียนบัญชีใหม่ (New Student)' : 'ยินดีต้อนรับสู่ระบบนิสิต (Log In)'}
            </p>
          </div>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[13px] font-black text-slate-900 uppercase ml-2 tracking-widest">รหัสนิสิต / Student ID</label>
              <input className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-200 outline-none text-slate-900 font-bold text-sm focus:border-blue-500 transition-all" placeholder="กรอกรหัส" value={authForm.id} onChange={e => setAuthForm({...authForm, id: e.target.value})} required />
            </div>
            <div className="space-y-1">
              <label className="text-[13px] font-black text-slate-900 uppercase ml-2 tracking-widest">รหัสผ่าน / Password</label>
              <input className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-200 outline-none text-slate-900 font-bold text-sm focus:border-blue-500 transition-all" type="password" placeholder="กรอกรหัสผ่าน" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} required />
            </div>
            {isRegistering && (
              <div className="space-y-4 pt-4 border-t border-slate-100 mt-4">
                <div className="grid grid-cols-2 gap-3">
                   <div className="space-y-1">
                     <label className="text-[10px] font-black text-slate-500 uppercase ml-1">ชื่อจริง (First Name)</label>
                     <input className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900" placeholder="ชื่อ" value={authForm.firstName} onChange={e => setAuthForm({...authForm, firstName: e.target.value})} />
                   </div>
                   <div className="space-y-1">
                     <label className="text-[10px] font-black text-slate-500 uppercase ml-1">นามสกุล (Last Name)</label>
                     <input className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900" placeholder="นามสกุล" value={authForm.lastName} onChange={e => setAuthForm({...authForm, lastName: e.target.value})} />
                   </div>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">คณะ (Faculty)</label>
                    <select className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900" value={authForm.faculty} onChange={e => setAuthForm({...authForm, faculty: e.target.value})}>
                        <option value="">เลือกคณะ</option>
                        {Object.keys(FACULTIES).map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">สาขาวิชา (Major)</label>
                    <select className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900" value={authForm.major} onChange={e => setAuthForm({...authForm, major: e.target.value})} disabled={!authForm.faculty}>
                        <option value="">เลือกสาขา</option>
                        {authForm.faculty && FACULTIES[authForm.faculty].map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">อาจารย์ที่ปรึกษา (Advisor)</label>
                    <input className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900" placeholder="ชื่ออาจารย์ที่ปรึกษา" value={authForm.advisorName} onChange={e => setAuthForm({...authForm, advisorName: e.target.value})} />
                </div>
              </div>
            )}
            <button className="w-full h-14 bg-blue-600 text-white rounded-2xl font-black text-lg mt-6 shadow-lg active:scale-95 transition-all">{isRegistering ? 'สร้างบัญชีนิสิต' : 'เข้าสู่ระบบ'}</button>
          </form>
          <button onClick={() => setIsRegistering(!isRegistering)} className="w-full mt-8 p-4 rounded-2xl bg-slate-50 text-xs font-black text-slate-500 hover:text-blue-600 transition-all uppercase tracking-widest">
            {isRegistering ? 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ' : 'ยังไม่มีบัญชี? สมัครสมาชิกที่นี่'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#F8FAFC] font-['Kanit'] overflow-hidden relative">
      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]" onClick={() => setIsSidebarOpen(false)} />}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-white z-[110] shadow-2xl transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 pt-12">
          <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-50">
            <div className={`w-12 h-12 ${isAdmin ? 'bg-red-700' : 'bg-blue-600'} rounded-2xl flex items-center justify-center text-white text-xl shadow-lg overflow-hidden`}>
              {isAdmin ? <i className="fa-solid fa-user-tie"></i> : (currentUser?.profileImage ? <img src={currentUser.profileImage} className="w-full h-full object-cover" /> : <i className="fa-solid fa-user"></i>)}
            </div>
            <div>
              <h3 className="font-black text-slate-800 leading-none">{isAdmin ? 'ADMIN PANEL' : currentUser?.firstName}</h3>
              <p className={`text-[10px] ${isAdmin ? 'text-red-500' : 'text-slate-400'} mt-1 uppercase font-bold tracking-widest`}>{isAdmin ? 'ผู้ดูแลระบบ' : currentUser?.id}</p>
            </div>
          </div>
          <nav className="space-y-2">
            {!isAdmin ? (
              <>
                {[
                  { id: 'home', icon: 'fa-house', label: 'ลงทะเบียน' }, 
                  { id: 'ai-advice', icon: 'fa-sparkles', label: 'ที่ปรึกษา AI' },
                  { id: 'profile', icon: 'fa-id-card', label: 'ประวัติส่วนตัว' }, 
                  { id: 'how-to', icon: 'fa-circle-question', label: 'วิธีลงทะเบียน' }
                ].map(item => (
                  <button key={item.id} onClick={() => { setSidebarView(item.id as any); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${sidebarView === item.id ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}>
                    <i className={`fa-solid ${item.icon} w-5`}></i><span className="text-sm">{item.label}</span>
                  </button>
                ))}
              </>
            ) : (
              <>
                <button onClick={() => { setSidebarView('admin'); setAdminSubView('users'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${sidebarView === 'admin' && adminSubView === 'users' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
                  <i className="fa-solid fa-users-gear w-5"></i><span className="text-sm">จัดการบัญชีนิสิต</span>
                </button>
              </>
            )}
            <button onClick={() => { setIsLoggedIn(false); setIsAdmin(false); setCurrentUser(null); }} className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-400 hover:bg-red-50 mt-10 transition-all font-bold">
              <i className="fa-solid fa-arrow-right-from-bracket w-5"></i><span className="text-sm">ออกจากระบบ</span>
            </button>
          </nav>
        </div>
      </aside>

      <header className={`px-6 py-6 border-b border-slate-100 flex justify-between items-center sticky top-0 z-50 ${isAdmin ? 'bg-red-950 text-white shadow-lg' : 'bg-white text-slate-800'}`}>
        <button onClick={() => setIsSidebarOpen(true)} className={`w-12 h-12 rounded-2xl flex items-center justify-center active:scale-95 transition-all ${isAdmin ? 'bg-red-900/50 text-white' : 'bg-slate-50 text-slate-500'}`}><i className="fa-solid fa-bars-staggered text-xl"></i></button>
        <div className="text-center">
          <h1 className="font-black text-lg uppercase leading-none tracking-tight">TSU SMART GUIDE {isAdmin ? 'ADMIN' : ''}</h1>
          <p className={`text-[10px] uppercase font-black tracking-widest mt-1 ${isAdmin ? 'text-red-400' : 'text-slate-400'}`}>
            {sidebarView === 'admin' ? 'COMMAND CENTER' : 'STUDENT PORTAL'}
          </p>
        </div>
        <div className="w-12 h-12 flex items-center justify-center">{isAdmin ? <i className="fa-solid fa-crown text-red-500 animate-pulse"></i> : (currentUser?.isEnrolled && <i className="fa-solid fa-circle-check text-emerald-500"></i>)}</div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 pb-32 bg-[#F8FAFC]">
        {!isAdmin && sidebarView === 'home' && (
            <div className="max-w-4xl mx-auto">
                <div className="mb-10">
                  <h2 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-3">
                    <i className="fa-solid fa-pen-to-square text-blue-600"></i> 
                    {activeBottomTab === 'schedule' ? 'ตารางเรียนของคุณ' : 'เลือกรายวิชาเรียน'}
                  </h2>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                    {activeBottomTab === 'schedule' 
                      ? 'ตรวจสอบเวลาเรียนและยืนยันการลงทะเบียนที่นี่' 
                      : 'ค้นหาและเลือกวิชาที่เปิดสอนตามคณะและสาขาของคุณ'}
                  </p>
                </div>

                {activeBottomTab === 'schedule' ? (
                   <div className="space-y-6 animate-in fade-in duration-500">
                        {currentUser?.schedule.length === 0 ? (
                          <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-200 shadow-inner">
                            <i className="fa-solid fa-calendar-minus text-4xl text-slate-200 mb-4 block"></i>
                            <p className="italic text-slate-400 font-bold text-sm">ยังไม่ได้เลือกรายวิชาเรียน</p>
                            <button onClick={() => setActiveBottomTab('major')} className="mt-4 text-blue-500 font-black text-[10px] uppercase tracking-widest hover:underline">เริ่มเลือกวิชาที่นี่</button>
                          </div>
                        ) : (
                          <WeeklyTimetable schedule={currentUser?.schedule || []} />
                        )}
                        
                        {currentUser?.schedule.length! > 0 && (
                            <div className={`p-8 rounded-[40px] border-2 text-center transition-all ${currentUser?.isEnrolled ? 'bg-emerald-50 border-emerald-100 shadow-inner' : 'bg-white border-blue-100 shadow-2xl shadow-blue-50'}`}>
                                {currentUser?.isEnrolled ? (
                                    <div className="flex flex-col items-center">
                                        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 text-xl shadow-sm"><i className="fa-solid fa-check"></i></div>
                                        <h3 className="text-lg font-black text-emerald-700">ลงทะเบียนสำเร็จแล้ว!</h3>
                                        <p className="text-emerald-600/60 text-[9px] font-black uppercase mt-1 tracking-widest">Enrollment Confirmed</p>
                                    </div>
                                ) : (
                                    <button onClick={() => setShowEnrollConfirm(true)} className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black text-lg shadow-2xl shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-4">
                                      <i className="fa-solid fa-circle-check"></i> ยืนยันผลการลงทะเบียน
                                    </button>
                                )}
                            </div>
                        )}
                   </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in duration-500">
                        {getVisibleCourses().length === 0 ? (
                           <div className="col-span-full py-16 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100">
                              <p className="text-slate-300 font-black text-[10px] uppercase tracking-widest italic">ไม่พบวิชาที่เปิดสอนสำหรับคณะ/สาขาของคุณ</p>
                           </div>
                        ) : (
                          getVisibleCourses().map(c => {
                            const isAdded = currentUser?.schedule.some(s => s.code === c.code);
                            return (
                                <div key={c.code} className={`bg-white p-4 rounded-[28px] border-2 transition-all cursor-pointer shadow-sm hover:shadow-md ${isAdded ? 'border-blue-500 ring-4 ring-blue-50' : 'border-slate-100'}`} onClick={() => setSelectedCourse(c)}>
                                    <div className="flex justify-between mb-2.5"><StatusBadge type={c.cat} /><span className="text-[9px] font-mono text-slate-400 font-bold">{c.code}</span></div>
                                    <h4 className="font-bold text-slate-800 text-[13px] mb-3 leading-snug h-9 line-clamp-2">{c.name}</h4>
                                    <div className="flex gap-3 text-[9px] text-slate-500 mb-4 font-bold"><span><i className="fa-solid fa-clock mr-1 text-blue-400"></i> {c.day} {c.time}</span></div>
                                    <button disabled={currentUser?.isEnrolled} onClick={(e) => { e.stopPropagation(); toggleCourse(c); }} className={`w-full py-2.5 rounded-xl text-[10px] font-black transition-all ${isAdded ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white'} ${currentUser?.isEnrolled ? 'opacity-50' : 'hover:scale-[1.02] active:scale-95'}`}>
                                        {isAdded ? 'นำออก (Remove)' : 'เลือกวิชา (Add)'}
                                    </button>
                                </div>
                            );
                          })
                        )}
                    </div>
                )}
            </div>
        )}

        {sidebarView === 'ai-advice' && (
          <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-10 duration-500">
             <div className="text-center mb-10">
               <div className="w-20 h-20 bg-blue-600 text-white rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-200">
                  <i className={`fa-solid fa-sparkles text-4xl ${isAiLoading ? 'animate-pulse' : ''}`}></i>
               </div>
               <h2 className="text-4xl font-black text-slate-800 mb-3 tracking-tight">ที่ปรึกษา AI อัจฉริยะ</h2>
               <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">AI-Powered Academic Advising</p>
             </div>

             <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm relative overflow-hidden min-h-[400px]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[100px] -mr-16 -mt-16 opacity-50"></div>
                
                {isAiLoading && !aiAdvice ? (
                  <div className="flex flex-col items-center justify-center h-64 space-y-6">
                     <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce delay-100"></div>
                        <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce delay-200"></div>
                     </div>
                     <p className="text-slate-400 font-bold animate-pulse">Gemini กำลังวิเคราะห์แผนการเรียนของคุณ...</p>
                  </div>
                ) : aiAdvice ? (
                  <div className="prose prose-slate max-w-none">
                     <div className="whitespace-pre-wrap font-medium text-slate-700 leading-relaxed text-lg">
                        {aiAdvice}
                        {isAiLoading && <span className="inline-block w-1.5 h-5 bg-blue-600 ml-1 animate-pulse"></span>}
                     </div>
                     {!isAiLoading && (
                       <button onClick={fetchAiAdvice} className="mt-12 w-full py-5 bg-slate-50 text-blue-600 border border-blue-100 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center justify-center gap-3">
                          <i className="fa-solid fa-rotate-right"></i> ขอคำแนะนำใหม่อีกครั้ง
                       </button>
                     )}
                  </div>
                ) : (
                  <div className="text-center py-16">
                     <i className="fa-solid fa-robot text-5xl text-slate-200 mb-6 block"></i>
                     <p className="text-slate-400 font-bold mb-10 italic">ยังไม่มีคำแนะนำในตอนนี้ กดปุ่มด้านล่างเพื่อเริ่มการวิเคราะห์</p>
                     <button onClick={fetchAiAdvice} className="px-12 py-6 bg-blue-600 text-white rounded-[32px] font-black text-xl shadow-2xl shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-4 mx-auto">
                        <i className="fa-solid fa-magic"></i> เริ่มวิเคราะห์ด้วย AI
                     </button>
                  </div>
                )}
             </div>

             <div className="mt-8 bg-orange-50 p-6 rounded-[32px] border border-orange-100 flex gap-4 items-start">
                <i className="fa-solid fa-lightbulb text-orange-400 text-xl mt-1"></i>
                <p className="text-orange-700/80 text-sm font-bold leading-relaxed italic">
                  คำแนะนำจาก AI เป็นเพียงแนวทางเบื้องต้น นิสิตควรตรวจสอบแผนการเรียนกับอาจารย์ที่ปรึกษาตัวจริงเพื่อความถูกต้องสูงสุด
                </p>
             </div>
          </div>
        )}

        {sidebarView === 'profile' && !isAdmin && currentUser && (
          <div className="max-w-xl mx-auto space-y-6 animate-in slide-in-from-left-10 duration-500">
            <h2 className="text-3xl font-black text-slate-800 mb-8 flex items-center gap-3"><i className="fa-solid fa-id-card text-blue-600"></i> ประวัติส่วนตัว</h2>
            <div className="bg-white p-10 rounded-[40px] text-center border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="relative w-32 h-32 mx-auto mb-8">
                  <div className="w-full h-full bg-slate-100 rounded-[40px] flex items-center justify-center text-4xl text-slate-300 overflow-hidden shadow-inner border-4 border-white ring-8 ring-slate-50">
                      {currentUser.profileImage ? <img src={currentUser.profileImage} className="w-full h-full object-cover" /> : <i className="fa-solid fa-user-graduate"></i>}
                  </div>
                  <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg border-2 border-white"><i className="fa-solid fa-camera text-sm"></i></button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleProfileImageChange(e, currentUser, setCurrentUser)} />
                </div>
                <div className="space-y-2 mb-10">
                  <h2 className="text-3xl font-black text-slate-800 leading-tight">{currentUser.firstName} {currentUser.lastName}</h2>
                  <p className="text-blue-600 font-black tracking-widest text-[12px] mt-2">ID: {currentUser.id}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="bg-slate-50 p-6 rounded-3xl text-left border border-slate-100">
                      <p className="text-[10px] font-black text-slate-600 uppercase mb-2">คณะ</p>
                      <p className="text-base font-bold text-slate-800">{currentUser.faculty}</p>
                   </div>
                   <div className="bg-slate-50 p-6 rounded-3xl text-left border border-slate-100">
                      <p className="text-[10px] font-black text-slate-600 uppercase mb-2">สาขาวิชา</p>
                      <p className="text-base font-bold text-slate-800">{currentUser.major}</p>
                   </div>
                   <div className="bg-slate-50 p-6 rounded-3xl text-left border border-slate-100 col-span-1 sm:col-span-2">
                      <p className="text-[10px] font-black text-slate-600 uppercase mb-2">อาจารย์ที่ปรึกษา</p>
                      <p className="text-base font-bold text-slate-800">{currentUser.advisorName || 'ยังไม่มีข้อมูล'}</p>
                   </div>
                </div>
            </div>
          </div>
        )}

        {sidebarView === 'how-to' && !isAdmin && (
          <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in duration-500 pb-16">
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-sm">
                <i className="fa-solid fa-circle-info text-4xl"></i>
              </div>
              <h2 className="text-4xl font-black text-slate-800 mb-3 tracking-tight">ขั้นตอนการลงทะเบียน</h2>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">How to use TSU Smart Guide</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-10 rounded-[48px] shadow-sm border border-slate-50 flex flex-col gap-6 group hover:shadow-xl transition-all duration-300">
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-[24px] flex items-center justify-center text-2xl font-black shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform">1</div>
                    <div>
                        <h4 className="text-2xl font-black text-slate-800 mb-3">ค้นหารายวิชา</h4>
                        <p className="text-slate-500 font-bold leading-relaxed text-sm">
                          เลือกแท็บเมนูจากแถบนำทางด้านล่าง <span className="text-blue-600">(วิชาเอก, เสริมบังคับ, วิชาเลือก)</span> 
                          เพื่อเรียกดูรายวิชาที่ระบบแนะนำตามสาขาวิชาของคุณ
                        </p>
                    </div>
                </div>

                <div className="bg-white p-10 rounded-[48px] shadow-sm border border-slate-50 flex flex-col gap-6 group hover:shadow-xl transition-all duration-300">
                    <div className="w-16 h-16 bg-orange-500 text-white rounded-[24px] flex items-center justify-center text-2xl font-black shadow-lg shadow-orange-100 group-hover:scale-110 transition-transform">2</div>
                    <div>
                        <h4 className="text-2xl font-black text-slate-800 mb-3">กดเลือกวิชาเรียน</h4>
                        <p className="text-slate-500 font-bold leading-relaxed text-sm">
                          เมื่อพบวิชาที่ถูกใจ กดปุ่ม <span className="text-orange-500">"เลือกวิชา"</span> เพื่อเพิ่มเข้าสู่ตารางเรียนส่วนตัว 
                          หากเวลาเรียนทับซ้อนกับวิชาอื่น ระบบจะแจ้งเตือนทันที
                        </p>
                    </div>
                </div>
            </div>
          </div>
        )}
      </main>

      {sidebarView === 'home' && !isAdmin && (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[94%] max-w-md bg-white/95 backdrop-blur-2xl p-2.5 rounded-[40px] flex justify-between items-center z-[90] shadow-2xl border border-slate-100">
          {[
            { id: 'major', icon: 'fa-book-bookmark', label: 'วิชาเอก' }, 
            { id: 'compulsory', icon: 'fa-shield-halved', label: 'เสริมบังคับ' }, 
            { id: 'general', icon: 'fa-shapes', label: 'วิชาเลือก' }, 
            { id: 'schedule', icon: 'fa-calendar-check', label: 'ตารางเรียน' }
          ].map(t => (
            <button key={t.id} onClick={() => setActiveBottomTab(t.id as any)} className={`flex-1 py-4 rounded-[32px] flex flex-col items-center gap-2 transition-all duration-500 ${activeBottomTab === t.id ? 'bg-blue-600 text-white shadow-xl scale-105 shadow-blue-200' : 'text-slate-400 hover:text-slate-600'}`}>
              <i className={`fa-solid ${t.icon} text-lg`}></i><span className="text-[9px] font-black uppercase tracking-[0.1em]">{t.label}</span>
            </button>
          ))}
        </nav>
      )}

      {selectedCourse && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
           <div className="w-full max-w-md bg-white rounded-[48px] p-10 shadow-2xl relative animate-in zoom-in duration-300">
              <button onClick={() => setSelectedCourse(null)} className="absolute top-10 right-10 text-slate-300 hover:text-red-500 active:scale-90 transition-colors"><i className="fa-solid fa-circle-xmark text-3xl"></i></button>
              <div className="mb-6"><StatusBadge type={selectedCourse.cat} /></div>
              <h3 className="text-3xl font-black text-slate-800 leading-tight mb-2">{selectedCourse.name}</h3>
              <p className="text-blue-600 text-sm font-black tracking-widest mb-10 bg-blue-50 py-1.5 px-4 rounded-xl inline-block">{selectedCourse.code} • {selectedCourse.credits} หน่วยกิต</p>
              <div className="space-y-4 mb-12">
                 <div className="flex justify-between items-center bg-slate-50 p-6 rounded-[32px] border border-slate-100 shadow-sm"><span className="text-[11px] font-black text-slate-500 uppercase">วันเรียน</span><span className="text-lg font-black text-slate-900">{selectedCourse.day}</span></div>
                 <div className="flex justify-between items-center bg-slate-50 p-6 rounded-[32px] border border-slate-100 shadow-sm"><span className="text-[11px] font-black text-slate-500 uppercase">เวลา</span><span className="text-lg font-black text-slate-900 italic">{selectedCourse.time}</span></div>
              </div>
              <button disabled={currentUser?.isEnrolled} onClick={() => { toggleCourse(selectedCourse); setSelectedCourse(null); }} className={`w-full py-6 rounded-[32px] font-black text-xl uppercase tracking-tighter shadow-2xl transition-all ${currentUser?.schedule.some(s => s.code === selectedCourse.code) ? 'bg-red-50 text-red-600 shadow-red-50' : 'bg-blue-600 text-white shadow-blue-100'} ${currentUser?.isEnrolled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}>
                {currentUser?.schedule.some(s => s.code === selectedCourse.code) ? 'ลบออกจากตาราง' : 'เพิ่มวิชานี้เข้าตาราง'}
              </button>
           </div>
        </div>
      )}

      {showEnrollConfirm && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
          <div className="w-full max-sm bg-white rounded-[40px] p-12 shadow-2xl text-center animate-in zoom-in duration-300">
             <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[40px] mx-auto flex items-center justify-center mb-10 shadow-inner"><i className="fa-solid fa-shield-heart text-5xl"></i></div>
             <h3 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">ยืนยันการลงทะเบียน?</h3>
             <p className="text-slate-500 text-base mb-12 font-bold italic leading-snug">เมื่อยืนยันแล้วจะไม่สามารถแก้ไขวิชาได้เอง หากต้องการเปลี่ยนต้องแจ้งแอดมินเท่านั้น</p>
             <button onClick={handleFinalEnroll} className="w-full py-6 bg-blue-600 text-white rounded-[28px] font-black shadow-2xl shadow-blue-100 mb-4 active:scale-95 text-xl uppercase">ตกลง, ยืนยันผล</button>
             <button onClick={() => setShowEnrollConfirm(false)} className="w-full py-4 bg-slate-50 text-slate-500 rounded-[28px] font-black text-xs uppercase tracking-widest hover:bg-slate-100">ย้อนกลับ</button>
          </div>
        </div>
      )}

      {conflictAlert && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-900/50 backdrop-blur-md">
          <div className="w-full max-sm bg-white rounded-[40px] p-10 shadow-2xl text-center animate-in zoom-in duration-300">
             <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[32px] mx-auto flex items-center justify-center mb-8 shadow-sm"><i className="fa-solid fa-triangle-exclamation text-3xl"></i></div>
             <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">เวลาเรียนทับซ้อน!</h3>
             <p className="text-slate-600 text-sm mb-10 leading-relaxed font-bold">
               วิชา <span className="text-red-600 font-black">{conflictAlert.course.name}</span> <br/>
               มีเวลาเรียนตรงกับวิชา <span className="text-slate-950 font-black underline">{conflictAlert.conflict.name}</span>
             </p>
             <button onClick={() => setConflictAlert(null)} className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-base shadow-xl active:scale-95 shadow-slate-200">เข้าใจแล้ว, แก้ไขใหม่</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
