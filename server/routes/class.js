import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Generate a 6-character alphanumeric class code
function generateClassCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1 to avoid confusion
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Ensure uniqueness
  const existing = db.prepare('SELECT id FROM classes WHERE class_code = ?').get(code);
  if (existing) return generateClassCode();
  return code;
}

// ─── TEACHER ENDPOINTS ────────────────────────────────────────────

// Create a class/quiz/game
router.post('/create', authenticate, (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Only teachers can create classes' });
  }

  const { name, description, type, questions } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Class name is required' });
  }

  try {
    const id = uuidv4();
    const classCode = generateClassCode();

    db.prepare(`
      INSERT INTO classes (id, teacher_id, name, description, class_code, type, questions)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, req.user.id, name.trim(), description || '', classCode, type || 'class', JSON.stringify(questions || []));

    res.status(201).json({
      id,
      classCode,
      name: name.trim(),
      type: type || 'class',
      message: 'Class created successfully'
    });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all classes created by this teacher
router.get('/my-classes', authenticate, (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Only teachers can view their classes' });
  }

  try {
    const classes = db.prepare(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM class_enrollments WHERE class_id = c.id AND status = 'approved') as student_count,
        (SELECT COUNT(*) FROM class_enrollments WHERE class_id = c.id AND status = 'pending') as pending_count
      FROM classes c
      WHERE c.teacher_id = ?
      ORDER BY c.created_at DESC
    `).all(req.user.id);

    res.json(classes.map(c => ({
      ...c,
      questions: JSON.parse(c.questions || '[]')
    })));
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get students enrolled in a specific class with their stats
router.get('/students/:classId', authenticate, (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    // Verify teacher owns this class
    const cls = db.prepare('SELECT * FROM classes WHERE id = ? AND teacher_id = ?').get(req.params.classId, req.user.id);
    if (!cls) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const students = db.prepare(`
      SELECT 
        u.id, u.name, u.email,
        ce.status as enrollment_status, ce.enrolled_at,
        up.total_score, up.overall_accuracy, up.completed_levels, up.pramana_accuracy,
        COALESCE((SELECT SUM(hints_used) FROM game_results WHERE user_id = u.id), 0) as hints_used,
        COALESCE((SELECT AVG(time_seconds) FROM game_results WHERE user_id = u.id), 0) as avg_time
      FROM class_enrollments ce
      JOIN users u ON ce.student_id = u.id
      LEFT JOIN user_progress up ON u.id = up.user_id
      WHERE ce.class_id = ? AND ce.status = 'approved'
      ORDER BY up.total_score DESC
    `).all(req.params.classId);

    // Also get class-specific results
    const classResults = db.prepare(`
      SELECT 
        cr.student_id, cr.score, cr.accuracy, cr.correct, cr.total, cr.time_seconds, cr.completed_at, cr.pramana_data
      FROM class_results cr
      WHERE cr.class_id = ?
      ORDER BY cr.completed_at DESC
    `).all(req.params.classId);

    res.json({
      classInfo: { ...cls, questions: JSON.parse(cls.questions || '[]') },
      students: students.map(s => ({
        ...s,
        completed_levels: JSON.parse(s.completed_levels || '[]'),
        pramana_accuracy: JSON.parse(s.pramana_accuracy || '{"pratyaksa":0,"anumana":0,"sabda":0}')
      })),
      classResults: classResults.map(r => ({
        ...r,
        pramana_data: JSON.parse(r.pramana_data || '[]')
      }))
    });
  } catch (error) {
    console.error('Get class students error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get pending join requests for a class
router.get('/requests/:classId', authenticate, (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const cls = db.prepare('SELECT id FROM classes WHERE id = ? AND teacher_id = ?').get(req.params.classId, req.user.id);
    if (!cls) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const requests = db.prepare(`
      SELECT ce.id, ce.status, ce.enrolled_at, u.id as student_id, u.name, u.email
      FROM class_enrollments ce
      JOIN users u ON ce.student_id = u.id
      WHERE ce.class_id = ?
      ORDER BY ce.enrolled_at DESC
    `).all(req.params.classId);

    res.json(requests);
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve or reject a join request
router.post('/approve', authenticate, (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { enrollmentId, action } = req.body; // action: 'approved' or 'rejected'
  if (!enrollmentId || !['approved', 'rejected'].includes(action)) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  try {
    // Verify teacher owns the class for this enrollment
    const enrollment = db.prepare(`
      SELECT ce.*, c.teacher_id 
      FROM class_enrollments ce
      JOIN classes c ON ce.class_id = c.id
      WHERE ce.id = ?
    `).get(enrollmentId);

    if (!enrollment || enrollment.teacher_id !== req.user.id) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    db.prepare('UPDATE class_enrollments SET status = ? WHERE id = ?').run(action, enrollmentId);
    res.json({ message: `Request ${action} successfully` });
  } catch (error) {
    console.error('Approve request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all students under this teacher (across all classes)
router.get('/all-students', authenticate, (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const students = db.prepare(`
      SELECT DISTINCT
        u.id, u.name, u.email,
        up.total_score, up.overall_accuracy, up.completed_levels, up.pramana_accuracy,
        COALESCE((SELECT SUM(hints_used) FROM game_results WHERE user_id = u.id), 0) as hints_used,
        COALESCE((SELECT COUNT(*) FROM game_results WHERE user_id = u.id), 0) as games_played,
        GROUP_CONCAT(DISTINCT c.name) as class_names
      FROM class_enrollments ce
      JOIN users u ON ce.student_id = u.id
      JOIN classes c ON ce.class_id = c.id
      LEFT JOIN user_progress up ON u.id = up.user_id
      WHERE c.teacher_id = ? AND ce.status = 'approved'
      GROUP BY u.id
      ORDER BY up.total_score DESC
    `).all(req.user.id);

    res.json(students.map(s => ({
      ...s,
      completed_levels: JSON.parse(s.completed_levels || '[]'),
      pramana_accuracy: JSON.parse(s.pramana_accuracy || '{"pratyaksa":0,"anumana":0,"sabda":0}')
    })));
  } catch (error) {
    console.error('Get all students error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get student stats for a specific game/class (for PDF download)
router.get('/game-stats/:classId', authenticate, (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const cls = db.prepare('SELECT * FROM classes WHERE id = ? AND teacher_id = ?').get(req.params.classId, req.user.id);
    if (!cls) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const results = db.prepare(`
      SELECT 
        u.name, u.email,
        cr.score, cr.accuracy, cr.correct, cr.total, cr.time_seconds, cr.completed_at, cr.pramana_data,
        up.total_score as overall_score, up.overall_accuracy
      FROM class_results cr
      JOIN users u ON cr.student_id = u.id
      LEFT JOIN user_progress up ON u.id = up.user_id
      WHERE cr.class_id = ?
      ORDER BY cr.score DESC
    `).all(req.params.classId);

    // Compute class-level stats
    const totalStudents = results.length;
    const avgScore = totalStudents > 0 ? Math.round(results.reduce((s, r) => s + r.score, 0) / totalStudents) : 0;
    const avgAccuracy = totalStudents > 0 ? Math.round(results.reduce((s, r) => s + r.accuracy, 0) / totalStudents) : 0;
    const avgTime = totalStudents > 0 ? Math.round(results.reduce((s, r) => s + r.time_seconds, 0) / totalStudents) : 0;

    res.json({
      classInfo: { name: cls.name, type: cls.type, code: cls.class_code, created_at: cls.created_at },
      summary: { totalStudents, avgScore, avgAccuracy, avgTime },
      results: results.map(r => ({
        ...r,
        pramana_data: JSON.parse(r.pramana_data || '[]')
      }))
    });
  } catch (error) {
    console.error('Get game stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── STUDENT ENDPOINTS ────────────────────────────────────────────

// Join a class by code
router.post('/join', authenticate, (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ error: 'Only students can join classes' });
  }

  const { classCode } = req.body;
  if (!classCode || !classCode.trim()) {
    return res.status(400).json({ error: 'Class code is required' });
  }

  try {
    const cls = db.prepare('SELECT * FROM classes WHERE class_code = ? AND status = ?').get(classCode.trim().toUpperCase(), 'active');
    if (!cls) {
      return res.status(404).json({ error: 'Invalid class code or class is no longer active' });
    }

    // Check if already enrolled
    const existing = db.prepare('SELECT * FROM class_enrollments WHERE class_id = ? AND student_id = ?').get(cls.id, req.user.id);
    if (existing) {
      return res.status(400).json({ error: `You have already ${existing.status === 'pending' ? 'requested to join' : 'joined'} this class` });
    }

    const id = uuidv4();
    db.prepare('INSERT INTO class_enrollments (id, class_id, student_id, status) VALUES (?, ?, ?, ?)').run(id, cls.id, req.user.id, 'pending');

    // Get teacher name
    const teacher = db.prepare('SELECT name FROM users WHERE id = ?').get(cls.teacher_id);

    res.status(201).json({
      message: 'Join request sent! Waiting for teacher approval.',
      className: cls.name,
      teacherName: teacher?.name || 'Unknown',
      status: 'pending'
    });
  } catch (error) {
    console.error('Join class error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get student's enrollments
router.get('/my-enrollments', authenticate, (req, res) => {
  try {
    const enrollments = db.prepare(`
      SELECT 
        ce.id as enrollment_id, ce.status, ce.enrolled_at,
        c.id as class_id, c.name as class_name, c.type, c.class_code, c.description, c.questions,
        u.name as teacher_name, u.institution
      FROM class_enrollments ce
      JOIN classes c ON ce.class_id = c.id
      JOIN users u ON c.teacher_id = u.id
      WHERE ce.student_id = ?
      ORDER BY ce.enrolled_at DESC
    `).all(req.user.id);

    res.json(enrollments.map(e => ({
      ...e,
      questions: e.status === 'approved' ? JSON.parse(e.questions || '[]') : []
    })));
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all teachers
router.get('/teachers', authenticate, (req, res) => {
  try {
    const teachers = db.prepare(`
      SELECT u.id, u.name, u.institution,
        (SELECT COUNT(DISTINCT c.id) FROM classes c WHERE c.teacher_id = u.id AND c.status = 'active') as active_classes,
        (SELECT COUNT(DISTINCT ce.student_id) FROM class_enrollments ce JOIN classes c ON ce.class_id = c.id WHERE c.teacher_id = u.id AND ce.status = 'approved') as total_students
      FROM users u
      WHERE u.role = 'teacher'
      ORDER BY u.name
    `).all();

    res.json(teachers);
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get teachers whose classes the student is enrolled in
router.get('/my-teachers', authenticate, (req, res) => {
  try {
    const teachers = db.prepare(`
      SELECT DISTINCT 
        u.id, u.name, u.institution,
        GROUP_CONCAT(DISTINCT c.name) as class_names
      FROM class_enrollments ce
      JOIN classes c ON ce.class_id = c.id
      JOIN users u ON c.teacher_id = u.id
      WHERE ce.student_id = ? AND ce.status = 'approved'
      GROUP BY u.id
      ORDER BY u.name
    `).all(req.user.id);

    res.json(teachers);
  } catch (error) {
    console.error('Get my teachers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit a result for a class game/quiz
router.post('/submit-result', authenticate, (req, res) => {
  const { classId, score, accuracy, correct, total, timeSeconds, pramanaData } = req.body;

  if (!classId) {
    return res.status(400).json({ error: 'Class ID is required' });
  }

  try {
    // Verify student is enrolled and approved
    const enrollment = db.prepare('SELECT * FROM class_enrollments WHERE class_id = ? AND student_id = ? AND status = ?')
      .get(classId, req.user.id, 'approved');
    if (!enrollment) {
      return res.status(403).json({ error: 'You are not enrolled in this class' });
    }

    const id = uuidv4();
    db.prepare(`
      INSERT INTO class_results (id, class_id, student_id, score, accuracy, correct, total, time_seconds, pramana_data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, classId, req.user.id, score || 0, accuracy || 0, correct || 0, total || 0, timeSeconds || 0, JSON.stringify(pramanaData || []));

    res.json({ message: 'Result submitted successfully' });
  } catch (error) {
    console.error('Submit class result error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
