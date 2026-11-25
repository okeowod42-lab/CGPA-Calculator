// Nigerian 5.0 grading scale
const gradeScale = [
  { min: 70, letter: "A", point: 5 },
  { min: 60, letter: "B", point: 4 },
  { min: 50, letter: "C", point: 3 },
  { min: 45, letter: "D", point: 2 },
  { min: 40, letter: "E", point: 1 },
  { min: 0,  letter: "F", point: 0 }
];

function getGrade(score) {
  return gradeScale.find(function (g) {
    return score >= g.min;
  });
}

function getDegreeClass(cgpa) {
  if (cgpa >= 4.5) return "First Class";
  if (cgpa >= 3.5) return "Second Class Upper";
  if (cgpa >= 2.4) return "Second Class Lower";
  if (cgpa >= 1.5) return "Third Class";
  if (cgpa >= 1.0) return "Pass";
  return "Fail";
}

// Page elements
const form = document.getElementById("course-form");
const nameInput = document.getElementById("course-name");
const unitsInput = document.getElementById("course-units");
const scoreInput = document.getElementById("course-score");
const formMessage = document.getElementById("form-message");
const courseBody = document.getElementById("course-body");
const clearBtn = document.getElementById("clear-btn");
const prevCgpaInput = document.getElementById("prev-cgpa");
const prevUnitsInput = document.getElementById("prev-units");
const prevMessage = document.getElementById("prev-message");
const totalUnitsEl = document.getElementById("total-units");
const gpaEl = document.getElementById("gpa");
const cgpaEl = document.getElementById("cgpa");
const degreeClassEl = document.getElementById("degree-class");

let courses = [];

// Load saved courses, if any
try {
  const saved = JSON.parse(localStorage.getItem("cgpa-courses"));
  if (Array.isArray(saved)) {
    courses = saved;
  }
} catch (error) {
  courses = [];
}

function saveCourses() {
  try {
    localStorage.setItem("cgpa-courses", JSON.stringify(courses));
  } catch (error) {
    // Saving is optional, so ignore errors
  }
}

function makeCell(text) {
  const td = document.createElement("td");
  td.textContent = text;
  return td;
}

function render() {
  // Rebuild the table
  courseBody.innerHTML = "";

  if (courses.length === 0) {
    const emptyRow = document.createElement("tr");
    emptyRow.className = "empty-row";
    const emptyCell = document.createElement("td");
    emptyCell.colSpan = 6;
    emptyCell.textContent = "No courses added yet.";
    emptyRow.appendChild(emptyCell);
    courseBody.appendChild(emptyRow);
  }

  let totalUnits = 0;
  let totalPoints = 0;

  courses.forEach(function (course, index) {
    const grade = getGrade(course.score);
    const points = course.units * grade.point;

    totalUnits += course.units;
    totalPoints += points;

    const row = document.createElement("tr");
    row.appendChild(makeCell(course.name));
    row.appendChild(makeCell(course.units));
    row.appendChild(makeCell(course.score));
    row.appendChild(makeCell(grade.letter));
    row.appendChild(makeCell(points));

    const actionCell = document.createElement("td");
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "remove-btn";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", function () {
      courses.splice(index, 1);
      saveCourses();
      render();
    });
    actionCell.appendChild(removeBtn);
    row.appendChild(actionCell);

    courseBody.appendChild(row);
  });

  // Semester GPA
  const gpa = totalUnits > 0 ? totalPoints / totalUnits : 0;

  // Previous record (optional)
  let prevUnits = parseFloat(prevUnitsInput.value);
  let prevCgpa = parseFloat(prevCgpaInput.value);
  prevMessage.textContent = "";

  if (isNaN(prevUnits) || isNaN(prevCgpa)) {
    prevUnits = 0;
    prevCgpa = 0;
  } else if (prevCgpa < 0 || prevCgpa > 5 || prevUnits < 0) {
    prevMessage.textContent = "Previous CGPA must be between 0 and 5, and units cannot be negative.";
    prevUnits = 0;
    prevCgpa = 0;
  }

  // Cumulative CGPA
  const allUnits = prevUnits + totalUnits;
  const allPoints = prevCgpa * prevUnits + totalPoints;
  const cgpa = allUnits > 0 ? allPoints / allUnits : 0;

  // Show the results
  totalUnitsEl.textContent = totalUnits;
  gpaEl.textContent = gpa.toFixed(2);
  cgpaEl.textContent = cgpa.toFixed(2);

  if (allUnits > 0) {
    degreeClassEl.textContent = getDegreeClass(Number(cgpa.toFixed(2)));
  } else {
    degreeClassEl.textContent = "Not available";
  }
}

form.addEventListener("submit", function (event) {
  event.preventDefault();
  formMessage.textContent = "";

  const name = nameInput.value.trim();
  const units = parseInt(unitsInput.value, 10);
  const score = parseFloat(scoreInput.value);

  if (name === "") {
    formMessage.textContent = "Please enter a course code or title.";
    return;
  }
  if (isNaN(units) || units < 1 || units > 10) {
    formMessage.textContent = "Credit units must be a whole number from 1 to 10.";
    return;
  }
  if (isNaN(score) || score < 0 || score > 100) {
    formMessage.textContent = "Score must be a number from 0 to 100.";
    return;
  }

  courses.push({ name: name, units: units, score: score });
  saveCourses();
  render();

  form.reset();
  nameInput.focus();
});

clearBtn.addEventListener("click", function () {
  courses = [];
  saveCourses();
  render();
});

prevCgpaInput.addEventListener("input", render);
prevUnitsInput.addEventListener("input", render);

render();