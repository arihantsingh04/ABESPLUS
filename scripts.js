const API_BASE = "http://localhost:3001"; // Use proxy for local testing; change to "" for same-origin production

// Theme toggle
function initTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
}

document.querySelectorAll("#themeToggle").forEach((btn) => {
  btn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  });
});

// Utility to show error messages
function showError(elementId, message) {
  const errorEl = document.getElementById(elementId);
  errorEl.textContent = message;
  errorEl.style.display = "block";
  errorEl.querySelector("::after")?.addEventListener("click", () => {
    errorEl.style.display = "none";
  });
}

// Utility to clear errors
function clearError(elementId) {
  const errorEl = document.getElementById(elementId);
  errorEl.style.display = "none";
}

// Show/hide loading spinner
function toggleLoading(show) {
  const spinner = document.getElementById("loading");
  spinner.classList.toggle("hidden", !show);
}

// Login handler
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError("error");
  toggleLoading(true);

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (!username || !password) {
    showError("error", "Username and password are required");
    toggleLoading(false);
    return;
  }

  try {
    const form = new URLSearchParams({ username, password });
    const response = await fetch(`${API_BASE}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    });
    const data = await response.json();
    console.log("Login response:", data);

    if (!response.ok) {
      showError("error", data.error || "Login failed");
      toggleLoading(false);
      return;
    }

    if (!data.token) {
      showError("error", "No token received from server");
      toggleLoading(false);
      return;
    }
    localStorage.setItem("token", data.token);
    window.location.href = "dashboard.html";
  } catch (err) {
    showError("error", "Server error: " + err.message);
  } finally {
    toggleLoading(false);
  }
});

// Logout handler
function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}

// Fetch and display student details and attendance summary
async function loadAttendanceSummary() {
  const token = localStorage.getItem("token");
  if (!token) {
    showError("error", "Please log in");
    return;
  }

  toggleLoading(true);
  try {
    const response = await fetch(`${API_BASE}/api/attendance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ token }),
    });
    const data = await response.json();
    console.log("Attendance response:", data);

    if (!response.ok) {
      showError("error", data.error || "Failed to fetch attendance");
      return;
    }

    // Student Details
    const studentEl = document.getElementById("studentDetails");
    studentEl.innerHTML = `
      <p><strong>ID:</strong> ${data.studentId || "N/A"}</p>
      <p><strong>Batch:</strong> ${data.batch || "N/A"}</p>
      <p><strong>Section:</strong> ${data.section || "N/A"}</p>
      <p><strong>Branch:</strong> ${data.branch || "N/A"}</p>
    `;

    // Attendance Summary
    const summaryEl = document.getElementById("attendanceSummary");
    const overallPercent = data.overallPercentage || 0;
    const percentClass = overallPercent < 50 ? "low" : overallPercent < 75 ? "medium" : "";
    summaryEl.innerHTML = `
      <p><strong>Total Present:</strong> ${data.totalPresent || 0}</p>
      <p><strong>Total Classes:</strong> ${data.totalClasses || 0}</p>
      <p><strong>Overall Attendance:</strong> ${overallPercent}%</p>
      <div class="progress-bar">
        <div class="progress-fill ${percentClass}" style="width: ${overallPercent}%"></div>
      </div>
      <h3>Daily Attendance</h3>
      <table>
        <tr><th>Course</th><th>Present</th><th>Total</th><th>Percent</th></tr>
        ${
          data.dailyAttendance?.length
            ? data.dailyAttendance
                .map(
                  (item) => {
                    const coursePercent = item.percent || 0;
                    const coursePercentClass = coursePercent < 50 ? "low" : coursePercent < 75 ? "medium" : "";
                    return `
                      <tr>
                        <td>${item.course || "Unknown"}</td>
                        <td>${item.present || 0}</td>
                        <td>${item.total || 0}</td>
                        <td>
                          ${coursePercent}%
                          <div class="progress-bar">
                            <div class="progress-fill ${coursePercentClass}" style="width: ${coursePercent}%"></div>
                          </div>
                        </td>
                      </tr>
                    `;
                  }
                )
                .join("")
            : "<tr><td colspan='4'>No data available</td></tr>"
        }
      </table>
    `;
  } catch (err) {
    showError("error", "Server error: " + err.message);
  } finally {
    toggleLoading(false);
  }
}

// Fetch and display detailed attendance
async function loadDetailedAttendance() {
  const token = localStorage.getItem("token");
  if (!token) {
    showError("error", "Please log in");
    return;
  }

  toggleLoading(true);
  try {
    const response = await fetch(`${API_BASE}/api/all-attendance`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    console.log("Detailed attendance response:", data);

    if (!response.ok) {
      showError("error", data.error || "Failed to fetch detailed attendance");
      return;
    }

    const detailedEl = document.getElementById("detailedAttendance");
    detailedEl.innerHTML = `
      <p><strong>Total Present (All Subjects):</strong> ${data.totalPresentAllSubjects || 0}</p>
      <p><strong>Total Absent:</strong> ${data.totalAbsentAllSubjects || 0}</p>
      <h3>Subject-wise Attendance</h3>
      ${
        data.subjects
          ? Object.entries(data.subjects)
              .map(([subject, { totalPresent, totalAbsent, daily }], index) => {
                const avgAttendance = totalPresent + totalAbsent > 0
                  ? Math.round((totalPresent / (totalPresent + totalAbsent)) * 100)
                  : 0;
                return `
                  <div class="subject-card" data-card-index="${index}">
                    <div class="subject-card-header">
                      <h4>${subject}</h4>
                      <div class="circle-progress">
                        <svg viewBox="0 0 36 36">
                          <defs>
                            <linearGradient id="progressGradient${index}" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" style="stop-color:#ff6b6b" />
                              <stop offset="100%" style="stop-color:#00c4b4" />
                            </linearGradient>
                          </defs>
                          <circle class="bg" cx="18" cy="18" r="16"></circle>
                          <circle class="fg" cx="18" cy="18" r="16"
                            stroke-dasharray="${avgAttendance}, 100" stroke-dashoffset="0"></circle>
                        </svg>
                        <span>${avgAttendance}%</span>
                      </div>
                    </div>
                    <p>Total Present: ${totalPresent || 0}, Total Absent: ${totalAbsent || 0}</p>
                    <div class="subject-details">
                      <table>
                        <tr><th>Date</th><th>Present</th><th>Absent</th></tr>
                        ${
                          daily?.length
                            ? daily
                                .map(
                                  (entry) =>
                                    `<tr>
                                      <td>${entry.date || "N/A"}</td>
                                      <td>${entry.present || 0}</td>
                                      <td>${entry.absent || 0}</td>
                                    </tr>`
                                )
                                .join("")
                            : "<tr><td colspan='3'>No data available</td></tr>"
                        }
                      </table>
                    </div>
                  </div>
                `;
              })
              .join("")
          : "<p>No subjects found</p>"
      }
    `;

    // Add click handlers for subject cards
    document.querySelectorAll(".subject-card").forEach((card) => {
      card.addEventListener("click", () => {
        card.classList.toggle("expanded");
      });
    });
  } catch (err) {
    showError("error", "Server error: " + err.message);
  } finally {
    toggleLoading(false);
  }
}

// Fetch and display quiz results
async function loadQuizResults() {
  const token = localStorage.getItem("token");
  if (!token) {
    showError("error", "Please log in");
    return;
  }

  toggleLoading(true);
  try {
    const response = await fetch(`${API_BASE}/api/quiz`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    console.log("Quiz response:", data);

    if (!response.ok) {
      showError("error", data.error || "Failed to fetch quiz results");
      return;
    }

    const quizEl = document.getElementById("quizResults");
    const quizzes = data.response?.data || [];
    quizEl.innerHTML = `
      <table>
        <tr>
          <th>Course</th>
          <th>Score</th>
          <th>Correct</th>
          <th>Incorrect</th>
          <th>Not Attempted</th>
          <th>Date</th>
        </tr>
        ${
          quizzes.length
            ? quizzes
                .map(
                  (quiz) => `
                    <tr>
                      <td>${quiz.master_course_code || "Unknown"}</td>
                      <td>${quiz.marks_obtained || "N/A"}</td>
                      <td>${quiz.correct || 0}</td>
                      <td>${quiz.incorrect || 0}</td>
                      <td>${quiz.not_attempted || 0}</td>
                      <td>${quiz.loggedin_at || "N/A"}</td>
                    </tr>
                  `
                )
                .join("")
            : "<tr><td colspan='6'>No quizzes found</td></tr>"
        }
      </table>
    `;
  } catch (err) {
    showError("error", "Server error: " + err.message);
  } finally {
    toggleLoading(false);
  }
}

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  if (window.location.pathname.includes("dashboard.html")) {
    loadAttendanceSummary();
    loadDetailedAttendance();
    loadQuizResults();
  }
});