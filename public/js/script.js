// ✅ NEW script.js for dynamic prefill + update
document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const student_id = urlParams.get('student_id');
  if (!student_id) return;

  try {
    const res = await fetch(`/api/student?student_id=${student_id}`);
    const student = await res.json();

    document.getElementById('student_id').value = student.student_id;
    document.getElementById('firstname').value = student.first_name;
    document.getElementById('middlename').value = student.mid_name || '';
    document.getElementById('lastname').value = student.last_name;
    document.getElementById('course').value = student.course_name;
    document.getElementById('faculty').value = student.faculty || '';
    document.getElementById(student.gender?.toLowerCase())?.checked = true;
    document.getElementById('attending').value = student.attending || '';
    document.getElementById('guests').value = student.guest_count || 0;
    document.getElementById('food').value = student.food_pref || '';
  } catch (err) {
    console.error('❌ Failed to load student:', err);
  }

  document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      student_id,
      mid_name: document.getElementById('middlename').value,
      faculty: document.getElementById('faculty').value,
      gender: document.querySelector('input[name="gender"]:checked')?.value,
      attending: document.getElementById('attending').value,
      guest_count: document.getElementById('guests').value,
      food_pref: document.getElementById('food').value,
      date_time: document.getElementById('submission_time').value,
    };

    try {
      const res = await fetch('/form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.text();
      alert(data);
    } catch (err) {
      alert('Failed to submit form.');
      console.error(err);
    }
  });
});
