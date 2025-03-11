/********************************************
 * SIDEBAR TOGGLE FUNCTIONALITY
 ********************************************/
const el = document.getElementById("wrapper")
const toggleButton = document.getElementById("menu-toggle")

toggleButton.onclick = () => {
  el.classList.toggle("toggled")
}
/* END SIDEBAR TOGGLE FUNCTIONALITY */


/********************************************
 * ATTENDANCE CHART
 ********************************************/
document.addEventListener("DOMContentLoaded", () => {
  var ctx = document.getElementById("attendanceChart")
  if (ctx) {
    ctx = ctx.getContext("2d")
    var myChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["On Time", "Late", "WFH", "Absent", "Sick Leave"],
        datasets: [
          {
            data: [1254, 32, 658, 14, 68],
            backgroundColor: ["#4e73df", "#f6c23e", "#1cc88a", "#e74a3b", "#36b9cc"],
            hoverBackgroundColor: ["#2e59d9", "#dda20a", "#13855c", "#be2617", "#2a96a5"],
            hoverBorderColor: "rgba(234, 236, 244, 1)",
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        tooltips: {
          backgroundColor: "rgb(255,255,255)",
          bodyFontColor: "#858796",
          borderColor: "#dddfeb",
          borderWidth: 1,
          xPadding: 15,
          yPadding: 15,
          displayColors: false,
          caretPadding: 10,
        },
        legend: {
          display: false,
        },
        cutoutPercentage: 80,
      },
    })
  }
})
/* END ATTENDANCE CHART */


/********************************************
 * PROFILE PHOTO UPDATE
 ********************************************/
function updateProfilePhoto(event) {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      document.getElementById("profileImage").src = e.target.result
    }
    reader.readAsDataURL(file)
  }
}
/* END PROFILE PHOTO UPDATE */


/********************************************
 * PUNCH IN/OUT FUNCTIONALITY
 ********************************************/
let isPunchedIn = false
let punchInTime = null
let timerInterval = null

const punchButton = document.getElementById("punchButton")
const punchStatus = document.getElementById("punchStatus")
const punchDateTime = document.getElementById("punchDateTime")
const punchTime = document.getElementById("punchTime")
const selfieContainer = document.getElementById("selfieContainer")
const video = document.getElementById("video")
const canvas = document.getElementById("canvas")
const captureButton = document.getElementById("captureButton")
const selfieImage = document.getElementById("selfieImage")

function updateTimer() {
  const now = new Date()
  const timeDiff = now - punchInTime
  const hours = Math.floor(timeDiff / 3600000)
  const minutes = Math.floor((timeDiff % 3600000) / 60000)
  const seconds = Math.floor((timeDiff % 60000) / 1000)
  punchTime.textContent = `Time elapsed: ${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}

function formatDateTime(date) {
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
}

function saveAttendance(type, time, imageDataUrl) {
  const attendance = JSON.parse(localStorage.getItem("attendance") || "[]")
  attendance.push({ type, time, imageDataUrl })
  localStorage.setItem("attendance", JSON.stringify(attendance))
  displayAttendance()
}

if (punchButton) {
  punchButton.addEventListener("click", () => {
    if (!isPunchedIn) {
      // Punch In
      isPunchedIn = true
      punchInTime = new Date()
      punchButton.textContent = "Punch Out"
      punchStatus.textContent = "You are currently punched in."
      punchDateTime.textContent = `Punch In: ${formatDateTime(punchInTime)}`
      timerInterval = setInterval(updateTimer, 1000)
      selfieContainer.style.display = "block"
      startCamera()
      video.style.display = "block"
      captureButton.style.display = "inline-block"
      selfieImage.style.display = "none"
      punchButton.classList.add("btn-danger")
      punchButton.classList.remove("btn-primary")
    } else {
      // Punch Out
      isPunchedIn = false
      clearInterval(timerInterval)
      const punchOutTime = new Date()
      punchButton.textContent = "Punch In"
      punchStatus.textContent = "You have punched out."
      punchDateTime.textContent += ` | Punch Out: ${formatDateTime(punchOutTime)}`
      punchTime.textContent = `Total time: ${punchTime.textContent.split(": ")[1]}`
      selfieContainer.style.display = "block"
      startCamera()
      video.style.display = "block"
      captureButton.style.display = "inline-block"
      selfieImage.style.display = "none"
      punchButton.classList.add("btn-primary")
      punchButton.classList.remove("btn-danger")
    }
  })
}

if (captureButton) {
  captureButton.addEventListener("click", () => {
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height)
    const imageDataUrl = canvas.toDataURL("image/jpeg")

    // Display the captured image
    selfieImage.src = imageDataUrl
    selfieImage.style.display = "block"
    video.style.display = "none"
    captureButton.style.display = "none"

    // Stop the camera
    stopCamera()

    // Save attendance data
    saveAttendance(isPunchedIn ? "punch_in" : "punch_out", new Date(), imageDataUrl)
  })
}

function startCamera() {
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      video.srcObject = stream
      video.play()
    })
    .catch((err) => {
      console.log("An error occurred: " + err)
    })
}

function stopCamera() {
  const stream = video.srcObject
  if (stream) {
    const tracks = stream.getTracks()
    tracks.forEach((track) => {
      track.stop()
    })
    video.srcObject = null
  }
}

function displayAttendance() {
  const attendance = JSON.parse(localStorage.getItem("attendance") || "[]")
  const attendanceTableBody = document.getElementById("attendanceTableBody")
  if (attendanceTableBody) {
    attendanceTableBody.innerHTML = ""

    attendance.forEach((record, index) => {
      if (index % 2 === 0) {
        const row = attendanceTableBody.insertRow()
        const dateCell = row.insertCell(0)
        const punchInTimeCell = row.insertCell(1)
        const punchInSelfieCell = row.insertCell(2)
        const punchOutTimeCell = row.insertCell(3)
        const punchOutSelfieCell = row.insertCell(4)
        const totalTimeCell = row.insertCell(5)

        dateCell.textContent = new Date(record.time).toLocaleDateString()
        punchInTimeCell.textContent = new Date(record.time).toLocaleTimeString()
        punchInSelfieCell.innerHTML = `<img src="${record.imageDataUrl}" alt="Punch In Selfie" width="50" height="50">`

        if (attendance[index + 1]) {
          const punchOutRecord = attendance[index + 1]
          punchOutTimeCell.textContent = new Date(punchOutRecord.time).toLocaleTimeString()
          punchOutSelfieCell.innerHTML = `<img src="${punchOutRecord.imageDataUrl}" alt="Punch Out Selfie" width="50" height="50">`

          const punchInTime = new Date(record.time)
          const punchOutTime = new Date(punchOutRecord.time)
          const timeDiff = punchOutTime - punchInTime
          const hours = Math.floor(timeDiff / 3600000)
          const minutes = Math.floor((timeDiff % 3600000) / 60000)
          totalTimeCell.textContent = `${hours}h ${minutes}m`
        }
      }
    })
  }
}
/* END PUNCH IN/OUT FUNCTIONALITY */


/********************************************
 * CALENDAR FUNCTIONALITY
 ********************************************/
const holidays = {
  "01-01": { name: "New Year's Day", type: "Mandatory" },
  "01-14": { name: "Makar Sankranti", type: "Optional" },
  "01-26": { name: "Republic Day", type: "Mandatory" },
  "02-19": { name: "Shivaji Jayanti", type: "Optional" },
  "03-14": { name: "Dhuliwandan", type: "Mandatory" },
  "03-31": { name: "Ramzan Id", type: "Mandatory" },
  "04-14": { name: "Ambedkar Jayanti", type: "Mandatory" },
  "04-18": { name: "Good Friday", type: "Mandatory" },
  "05-12": { name: "Buddha Purnima", type: "Optional" },
  "06-06": { name: "Id-ul-Zuha (Bakrid)", type: "Optional" },
  "08-15": { name: "Independence Day", type: "Mandatory" },
  "08-27": { name: "Ganesh Chaturthi", type: "Mandatory" },
  "10-02": { name: "Dussehra / Mahatma Gandhi Jayanti", type: "Mandatory" },
  "10-21": { name: "Diwali (Deepavali)", type: "Mandatory" },
  "11-11": { name: "Guru Nanak Jayanti", type: "Mandatory" },
  "12-25": { name: "Christmas Day", type: "Mandatory" },
}

const currentDate = new Date()

function renderCalendar() {
  const monthYear = document.getElementById("monthYear")
  const calendar = document.getElementById("calendar")
  if (!monthYear || !calendar) return

  calendar.innerHTML = ""

  const firstDayIndex = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()

  monthYear.innerText = currentDate.toLocaleDateString("en-us", { month: "long", year: "numeric" })

  const today = new Date()
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  daysOfWeek.forEach((day) => {
    const dayNameDiv = document.createElement("div")
    dayNameDiv.classList.add("day-name")
    dayNameDiv.innerText = day
    calendar.appendChild(dayNameDiv)
  })

  for (let i = 0; i < firstDayIndex; i++) {
    calendar.appendChild(document.createElement("div"))
  }

  for (let i = 1; i <= lastDay; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i)
    const fullDate = `${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`
    const dayDiv = document.createElement("div")
    dayDiv.classList.add("day")

    if (date.toDateString() === today.toDateString()) {
      dayDiv.classList.add("today")
    }
    if (date.getDay() === 0 || date.getDay() === 6) {
      dayDiv.classList.add("weekend")
    }

    const dayNumber = document.createElement("div")
    dayNumber.classList.add("day-number")
    dayNumber.innerText = i
    dayDiv.appendChild(dayNumber)

    if (holidays[fullDate]) {
      dayDiv.classList.add(holidays[fullDate].type.toLowerCase())
      const holidayName = document.createElement("div")
      holidayName.classList.add("holiday-name")
      holidayName.innerText = holidays[fullDate].name
      dayDiv.appendChild(holidayName)
    }

    calendar.appendChild(dayDiv)
  }
}

const prevMonthBtn = document.getElementById("prevMonth")
const nextMonthBtn = document.getElementById("nextMonth")

if (prevMonthBtn) {
  prevMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1)
    renderCalendar()
  })
}

if (nextMonthBtn) {
  nextMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1)
    renderCalendar()
  })
}
/* END CALENDAR FUNCTIONALITY */


/********************************************
 * NAVIGATION FUNCTIONS
 ********************************************/
function showProfileForm() {
  document.getElementById("profileSection").style.display = "block"
  document.getElementById("dashboardContent").style.display = "none"
  document.getElementById("attendanceRecords").style.display = "none"
  document.getElementById("reportsSection").style.display = "none"
  document.getElementById("holidayCalendarSection").style.display = "none"
  document.getElementById("leaveSection").style.display = "none"
  document.getElementById("resignationRecords").style.display = "none"
  document.getElementById("payrollSection").style.display = "none"
}

function showDashboard() {
  document.getElementById("profileSection").style.display = "none"
  document.getElementById("dashboardContent").style.display = "block"
  document.getElementById("attendanceRecords").style.display = "none"
  document.getElementById("reportsSection").style.display = "none"
  document.getElementById("holidayCalendarSection").style.display = "none"
  document.getElementById("leaveSection").style.display = "none"
  document.getElementById("resignationRecords").style.display = "none"
  document.getElementById("payrollSection").style.display = "none"
}

function showAttendanceRecords() {
  document.getElementById("profileSection").style.display = "none"
  document.getElementById("dashboardContent").style.display = "none"
  document.getElementById("attendanceRecords").style.display = "block"
  document.getElementById("reportsSection").style.display = "none"
  document.getElementById("holidayCalendarSection").style.display = "none"
  document.getElementById("leaveSection").style.display = "none"
  document.getElementById("resignationRecords").style.display = "none"
  document.getElementById("payrollSection").style.display = "none"
  displayAttendance()
}

function showReports() {
  document.getElementById("profileSection").style.display = "none"
  document.getElementById("dashboardContent").style.display = "none"
  document.getElementById("attendanceRecords").style.display = "none"
  document.getElementById("reportsSection").style.display = "block"
  document.getElementById("holidayCalendarSection").style.display = "none"
  document.getElementById("leaveSection").style.display = "none"
  document.getElementById("resignationRecords").style.display = "none"
  document.getElementById("payrollSection").style.display = "none"
}

function showResignation() {
  document.getElementById("profileSection").style.display = "none"
  document.getElementById("dashboardContent").style.display = "none"
  document.getElementById("attendanceRecords").style.display = "none"
  document.getElementById("reportsSection").style.display = "none"
  document.getElementById("holidayCalendarSection").style.display = "none"
  document.getElementById("leaveSection").style.display = "none"
  document.getElementById("resignationRecords").style.display = "block"
  document.getElementById("payrollSection").style.display = "none"
  displayResignation()
}

function showPayroll() {
  document.getElementById("profileSection").style.display = "none"
  document.getElementById("dashboardContent").style.display = "none"
  document.getElementById("attendanceRecords").style.display = "none"
  document.getElementById("reportsSection").style.display = "none"
  document.getElementById("holidayCalendarSection").style.display = "none"
  document.getElementById("leaveSection").style.display = "none"
  document.getElementById("resignationRecords").style.display = "none"
  document.getElementById("payrollSection").style.display = "block"
}

function showHolidayCalendar() {
  document.getElementById("profileSection").style.display = "none"
  document.getElementById("dashboardContent").style.display = "none"
  document.getElementById("attendanceRecords").style.display = "none"
  document.getElementById("reportsSection").style.display = "none"
  document.getElementById("holidayCalendarSection").style.display = "block"
  document.getElementById("leaveSection").style.display = "none"
  document.getElementById("resignationRecords").style.display = "none"
  document.getElementById("payrollSection").style.display = "none"
  renderCalendar()
}
/* END NAVIGATION FUNCTIONS */


/********************************************
 * EVENT LISTENERS
 ********************************************/
document.addEventListener("DOMContentLoaded", () => {
  showDashboard()

  document.getElementById("dashboardLink").addEventListener("click", (e) => {
    e.preventDefault()
    showDashboard()
  })

  document.getElementById("attendanceLink").addEventListener("click", (e) => {
    e.preventDefault()
    showAttendanceRecords()
  })

  document.getElementById("reportsLink").addEventListener("click", (e) => {
    e.preventDefault()
    showReports()
  })

  document.getElementById("resignationLink").addEventListener("click", (e) => {
    e.preventDefault()
    showResignation()
  })

  document.getElementById("payrollLink").addEventListener("click", (e) => {
    e.preventDefault()
    showPayroll()
  })

  document.getElementById("holidayCalendarLink").addEventListener("click", (e) => {
    e.preventDefault()
    showHolidayCalendar()
  })

  // Resignation Form Submission
  const submitResignationBtn = document.getElementById("submitResignation")
  if (submitResignationBtn) {
    submitResignationBtn.addEventListener("click", saveResignation)
  }

  // Initialize resignation records display
  displayResignation()
})
/* END EVENT LISTENERS */


/********************************************
 * REPORTS FUNCTIONALITY
 ********************************************/
function generateReport() {
  const reportType = document.getElementById("reportType").value
  const dateRange = document.getElementById("dateRange").value
  let reportTitle = ""
  let reportData = ""

  if (!dateRange) {
    alert("Please select a date range")
    return
  }

  switch (reportType) {
    case "attendance":
      reportTitle = "Personal Attendance & Work Hours Report"
      reportData = "You worked 162 hours in " + dateRange + ". You took 2 leaves."
      break
    case "leave":
      reportTitle = "Leave & Time-Off Report"
      reportData = "Leave balance: 5 Casual, 3 Sick. 1 Leave request pending."
      break
    case "payroll":
      reportTitle = "Payroll & Salary Report"
      reportData = "Your salary slip for " + dateRange + " is available for download."
      break
    case "task":
      reportTitle = "Task & Work Performance Report"
      reportData = "You completed 90% of your assigned tasks on time."
      break
    case "performance":
      reportTitle = "Performance Evaluation Report"
      reportData = "Your last appraisal rating: 4.5/5 ⭐"
      break
    case "wfh":
      reportTitle = "Work-from-Home Report"
      reportData = "You worked remotely for 12 days with an 85% productivity score."
      break
    case "benefits":
      reportTitle = "Employee Benefits Report"
      reportData = "Your medical insurance covers up to $5000 with 3 claims filed."
      break
    case "feedback":
      reportTitle = "Feedback & Engagement Report"
      reportData = "Your workplace satisfaction rating is 4.2/5. 2 suggestions submitted."
      break
  }

  document.getElementById("reportTitle").innerText = reportTitle
  document.getElementById("reportData").innerText = reportData
  document.getElementById("reportContent").style.display = "block"
}

function downloadReport() {
  alert("Downloading report as PDF...")
  // Implement actual PDF download functionality here
}
/* END REPORTS FUNCTIONALITY */


/********************************************
 * LEAVE MANAGEMENT FUNCTIONALITY
 ********************************************/
const leaveSection = document.getElementById("leaveSection")
const leaveForm = document.getElementById("leaveForm")
const leaveHistoryList = document.getElementById("leaveHistoryList")
const fromDateInput = document.getElementById("fromDate")
const toDateInput = document.getElementById("toDate")
const leaveTypeSelect = document.getElementById("leaveType")
const reasonInput = document.getElementById("reason")
const totalDaysSpan = document.getElementById("totalDays")

const leaveHistory = [
  { date: "Feb 15", type: "Medical", leaveType: "Full Day", status: "Pending", days: 1.0 },
  { date: "Feb 10", type: "Personal", leaveType: "Half Day", status: "Approved", days: 0.5 },
  { date: "Jan 25", type: "Vacation", leaveType: "Full Day", status: "Rejected", days: 2.0 },
]

function showLeaveSection() {
  document.getElementById("profileSection").style.display = "none"
  document.getElementById("dashboardContent").style.display = "none"
  document.getElementById("attendanceRecords").style.display = "none"
  document.getElementById("reportsSection").style.display = "none"
  document.getElementById("holidayCalendarSection").style.display = "none"
  leaveSection.style.display = "block"
}

function renderLeaveHistory() {
  if (!leaveHistoryList) return
  
  leaveHistoryList.innerHTML = ""
  leaveHistory.forEach((leave) => {
    const leaveItem = document.createElement("div")
    leaveItem.className = "list-group-item d-flex justify-content-between align-items-center"
    leaveItem.innerHTML = `
            <div>
                <div class="fw-bold">${leave.date} - ${leave.type}</div>
                <div class="text-muted">${leave.leaveType}</div>
            </div>
            <div class="d-flex align-items-center">
                <span class="me-3">${leave.days} days</span>
                <span class="badge bg-${leave.status === "Approved" ? "success" : leave.status === "Rejected" ? "danger" : "warning"} rounded-pill">${leave.status}</span>
            </div>
        `
    leaveHistoryList.appendChild(leaveItem)
  })
}

function calculateTotalDays(fromDate, toDate, leaveType) {
  if (!fromDate || !toDate) return 1.0

  const start = new Date(fromDate)
  const end = new Date(toDate)
  const diffTime = Math.abs(end - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

  return leaveType === "HalfDay" ? diffDays * 0.5 : diffDays
}

function updateTotalDays() {
  const totalDays = calculateTotalDays(fromDateInput.value, toDateInput.value, leaveTypeSelect.value)
  totalDaysSpan.textContent = totalDays.toFixed(1)
}

function setMinDates() {
  const today = new Date().toISOString().split("T")[0]
  fromDateInput.min = today
  toDateInput.min = today
}

fromDateInput.addEventListener("change", () => {
  toDateInput.min = fromDateInput.value
  updateTotalDays()
})

toDateInput.addEventListener("change", updateTotalDays)
leaveTypeSelect.addEventListener("change", updateTotalDays)

leaveForm.addEventListener("submit", (e) => {
  e.preventDefault()

  const fromDate = new Date(fromDateInput.value)
  const newLeave = {
    date: fromDate.toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
    type: reasonInput.value || "Personal",
    leaveType: leaveTypeSelect.value === "HalfDay" ? "Half Day" : "Full Day",
    status: "Pending",
    days: Number.parseFloat(totalDaysSpan.textContent),
  }

  leaveHistory.unshift(newLeave)
  renderLeaveHistory()

  leaveForm.reset()
  totalDaysSpan.textContent = "1.0"

  alert("Leave request submitted successfully!")
})

document.addEventListener("DOMContentLoaded", () => {
  setMinDates()
  renderLeaveHistory()

  document.getElementById("leaveLink").addEventListener("click", (e) => {
    e.preventDefault()
    showLeaveSection()
  })
})

// Update current month
const currentMonthElement = document.querySelector(".current-month")
const currentMonth = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })
currentMonthElement.textContent = currentMonth
/* END LEAVE MANAGEMENT FUNCTIONALITY */


/********************************************
 * START PAYROLL FUNCTIONALITY
 ********************************************/
document.addEventListener('DOMContentLoaded', function() {
  // Tab Switching Logic
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tabpay-content');

  tabButtons.forEach(button => {
      button.addEventListener('click', () => {
          // Remove active class from all buttons and contents
          tabButtons.forEach(btn => btn.classList.remove('active'));
          tabContents.forEach(content => content.classList.remove('active'));

          // Add active class to clicked button and corresponding content
          button.classList.add('active');
          const tabId = button.getAttribute('data-tab');
          document.getElementById(`${tabId}Tab`).classList.add('active');
      });
  });

    // Populate Year Selector Dynamically
    const yearSelect = document.getElementById('yearSelect');
    for (let i = 2024; i <= 2040; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        yearSelect.appendChild(option);
    }

       // Populate Month Selector Dynamically
  const monthSelect = document.getElementById('monthSelect');
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  months.forEach(month => {
      const option = document.createElement('option');
      option.value = month;
      option.textContent = month;
      monthSelect.appendChild(option);
  });

    // Set default selection to current month and year
    const currentYear = new Date().getFullYear();
    yearSelect.value = currentYear;
    monthSelect.value = months[new Date().getMonth()];



  // PDF Generation Logic
  const downloadBtn = document.getElementById('downloadBtn');
  downloadBtn.addEventListener('click', generatePDF);

  function generatePDF() {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      // Set initial coordinates
      let y = 20;
      
      // Add company header
      doc.setFontSize(16);
      doc.text('Cybromatech Technology Pvt Ltd', 20, y);
      
      y += 10;
      doc.setFontSize(10);
      doc.text('Marisoft Tech Park, Marisoft 1,4 FLOOR, KALYANI NAGAR, Pune, Maharashtra - 411014', 20, y);
      
      y += 20;
      // Add payslip header
      doc.setFontSize(14);
      const month = document.getElementById('monthSelect').value;
      const year = document.getElementById('yearSelect').value;
      doc.text(`Payslip for the Month of ${month}, ${year}`, 20, y);
      
      // Add employee details
      y += 20;
      doc.setFontSize(10);
      const employeeDetails = [
          ['Name:', 'Vikas Patil', 'Employee ID:', 'CTR/EMP1101'],
          ['Designation:', 'Data Science', 'Bank Name:', 'YES BANK'],
          ['Department:', 'Software Developer', 'Bank Account No:', '1636085692014'],
          ['Location:', 'Pune', 'PAN No.:', 'HAOP658A'],
          ['Effective Work Days:', '31', '', ''],
          ['LOP:', '2.0', '', '']
      ];

      employeeDetails.forEach(row => {
          doc.text(row[0], 20, y);
          doc.text(row[1], 60, y);
          if (row[2]) {
              doc.text(row[2], 120, y);
              doc.text(row[3], 160, y);
          }
          y += 10;
      });

      // Add earnings
      y += 10;
      doc.setFontSize(12);
      doc.text('Earnings', 20, y);
      
      y += 10;
      doc.setFontSize(10);
      doc.text('Basic:', 20, y);
      doc.text('20,000', 60, y);

      y += 10;
      doc.text('Total Earnings (Rs):', 20, y);
      doc.text('20,000', 60, y);

      // Add deductions
      y += 20;
      doc.setFontSize(12);
      doc.text('Deductions', 20, y);
      
      y += 10;
      doc.setFontSize(10);
      const deductions = [
          ['Term Insurance:', '1,000'],
          ['Health Insurance:', '1,000'],
          ['PF Employee:', '1,600'],
          ['PT:', '200']
      ];

      deductions.forEach(row => {
          doc.text(row[0], 20, y);
          doc.text(row[1], 60, y);
          y += 10;
      });

      doc.text('Total Deductions (Rs):', 20, y);
      doc.text('3,800', 60, y);

      // Add net pay
      y += 20;
      doc.setFontSize(12);
      doc.text('Net Pay For The Month (Rs) : 16,200', 20, y);
      // doc.text('16,200', 60, y);

      y += 10;
      doc.setFontSize(10);
      doc.text('(Sixteen Thousand Two Hundred Rupees Only)', 20, y);

      // Add disclaimer
      y += 20;
      doc.setFontSize(8);
      doc.text('* This is a system generated payslip and does not require signature.', 20, y);

      // Save the PDF
      doc.save(`payslip-${month}-${year}.pdf`);
  }

  // Initialize the salary table data
  const salaryData = [
      ['GROSS', '20,000', '2,24,000'],
      ['Basic', '20,000', '2,24,000'],
      ['HRA', '0', '0'],
      ['PF Employer', '1,600', '19,200'],
      ['Overtime', '0', '0'],
      ['Term Insurance', '1,000', '12,000'],
      ['Health Insurance', '1,000', '12,000'],
      ['ESI Employer', '0', '0'],
      ['Special Allowance', '0', '0']
  ];

  // Populate salary table
  const salaryTableBody = document.querySelector('.salary-table tbody');
  salaryData.forEach(row => {
      const tr = document.createElement('tr');
      row.forEach(cell => {
          const td = document.createElement('td');
          td.textContent = cell;
          tr.appendChild(td);
      });
      salaryTableBody.appendChild(tr);
  });
});
/* END PAYROLL FUNCTIONALITY */


/********************************************
 * START RESIGNATION FUNCTIONALITY
 ********************************************/
document.addEventListener("DOMContentLoaded", () => {
  const resignationLink = document.getElementById("resignationLink")
  const resignationRecords = document.getElementById("resignationRecords")
  const dashboardContent = document.querySelectorAll(".dashboard-content")
  
  resignationLink.addEventListener("click", (e) => {
    e.preventDefault()
    resignationRecords.style.display = "block"
    for (let i = 0; i < dashboardContent.length; i++) {
      if (dashboardContent[i] !== resignationRecords) {
        dashboardContent[i].style.display = "none"
      }
    }
    displayResignation()
  })
})

function groupResignationByDate(resignations) {
  return resignations.reduce((acc, record) => {
    const date = new Date(record.date).toLocaleDateString()
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(record)
    return acc
  }, {})
}

function saveResignation() {
  // Get form values
  const fullName = document.getElementById("fullName").value
  const employeeId = document.getElementById("employeeId").value
  const department = document.getElementById("department").value
  const designation = document.getElementById("designation").value
  const joiningDate = document.getElementById("joiningDate").value
  const lastWorkingDay = document.getElementById("lastWorkingDay").value
  const resignationReason = document.getElementById("resignationReason").value
  const otherReason = document.getElementById("otherReason").value
  const noticeYes = document.getElementById("noticeYes").checked
  const noticeNo = document.getElementById("noticeNo").checked
  const managerName = document.getElementById("managerName").value
  const feedback = document.getElementById("feedback").value
  const suggestions = document.getElementById("suggestions").value
  const itClearance = document.getElementById("itClearance").checked
  const hrClearance = document.getElementById("hrClearance").checked
  const financeClearance = document.getElementById("financeClearance").checked
  const managerApproval = document.getElementById("managerApproval").checked
  const submissionDate = document.getElementById("submissionDate").value || new Date().toISOString().split('T')[0]

  // Validate required fields
  if (!fullName || !employeeId) {
    alert("Please fill in all required fields")
    return
  }

  // Create resignation object
  const resignation = {
    id: Date.now().toString(),
    fullName,
    employeeId,
    department,
    designation,
    joiningDate,
    lastWorkingDay,
    reason: resignationReason === "Other" ? otherReason : resignationReason,
    noticePeriod: noticeYes ? "Yes" : noticeNo ? "No" : "",
    managerName,
    feedback,
    suggestions,
    clearance: {
      it: itClearance,
      hr: hrClearance,
      finance: financeClearance,
      manager: managerApproval
    },
    date: submissionDate,
    status: "Pending",
    submittedOn: new Date().toISOString()
  }

  // Save to localStorage
  const resignations = JSON.parse(localStorage.getItem("resignations") || "[]")
  resignations.push(resignation)
  localStorage.setItem("resignations", JSON.stringify(resignations))

  // Close modal and refresh table
  const modalElement = document.getElementById('exitFormModal');
  const modal = bootstrap.Modal.getInstance(modalElement);
  modal.hide()
  
  // Reset form
  document.getElementById("resignationForm").reset()
  
  // Display updated resignation records
  displayResignation()
  
  // Show success message
  alert("Resignation submitted successfully!")
}

function displayResignation() {
  const resignations = JSON.parse(localStorage.getItem("resignations") || "[]")
  const resignationTableBody = document.getElementById("resignationTableBody")
  
  if (!resignationTableBody) return
  
  resignationTableBody.innerHTML = ""

  if (resignations.length === 0) {
    const row = document.createElement("tr")
    row.innerHTML = `<td colspan="4" class="text-center">No resignation records found</td>`
    resignationTableBody.appendChild(row)
    return
  }

  resignations.forEach((record) => {
    const row = document.createElement("tr")
    row.innerHTML = `
      <td>${new Date(record.date).toLocaleDateString()}</td>
      <td>${record.reason || "No reason provided"}</td>
      <td><span class="badge bg-${record.status === "Approved" ? "success" : record.status === "Rejected" ? "danger" : "warning"}">${record.status}</span></td>
      <td><button class="btn btn-sm btn-info view-resignation" data-id="${record.id}">View</button></td>
    `
    resignationTableBody.appendChild(row)
  })

  // Add event listeners to view buttons
  document.querySelectorAll(".view-resignation").forEach(button => {
    button.addEventListener("click", (e) => {
      const id = e.target.getAttribute("data-id")
      viewResignationDetails(id)
    })
  })
}

function viewResignationDetails(id) {
  const resignations = JSON.parse(localStorage.getItem("resignations") || "[]")
  const resignation = resignations.find(r => r.id === id)
  
  if (!resignation) {
    alert("Resignation record not found")
    return
  }
  
  const detailsBody = document.getElementById("resignationDetailsBody")
  
  detailsBody.innerHTML = `
    <div class="row mb-3">
      <div class="col-md-6">
        <h6>Employee Information</h6>
        <p><strong>Name:</strong> ${resignation.fullName}</p>
        <p><strong>Employee ID:</strong> ${resignation.employeeId}</p>
        <p><strong>Department:</strong> ${resignation.department}</p>
        <p><strong>Designation:</strong> ${resignation.designation}</p>
      </div>
      <div class="col-md-6">
        <h6>Resignation Details</h6>
        <p><strong>Date of Joining:</strong> ${resignation.joiningDate ? new Date(resignation.joiningDate).toLocaleDateString() : 'N/A'}</p>
        <p><strong>Last Working Day:</strong> ${resignation.lastWorkingDay ? new Date(resignation.lastWorkingDay).toLocaleDateString() : 'N/A'}</p>
        <p><strong>Reason:</strong> ${resignation.reason}</p>
        <p><strong>Notice Period Served:</strong> ${resignation.noticePeriod}</p>
      </div>
    </div>
    
    <div class="row mb-3">
      <div class="col-md-6">
        <h6>Feedback</h6>
        <p><strong>Work Experience:</strong> ${resignation.feedback || 'No feedback provided'}</p>
        <p><strong>Suggestions:</strong> ${resignation.suggestions || 'No suggestions provided'}</p>
      </div>
      <div class="col-md-6">
        <h6>Clearance Status</h6>
        <p><strong>IT Clearance:</strong> ${resignation.clearance?.it ? 'Completed' : 'Pending'}</p>
        <p><strong>HR Clearance:</strong> ${resignation.clearance?.hr ? 'Completed' : 'Pending'}</p>
        <p><strong>Finance Clearance:</strong> ${resignation.clearance?.finance ? 'Completed' : 'Pending'}</p>
        <p><strong>Manager Approval:</strong> ${resignation.clearance?.manager ? 'Approved' : 'Pending'}</p>
      </div>
    </div>
    
    <div class="row">
      <div class="col-md-12">
        <h6>Status Information</h6>
        <p><strong>Current Status:</strong> <span class="badge bg-${resignation.status === "Approved" ? "success" : resignation.status === "Rejected" ? "danger" : "warning"}">${resignation.status}</span></p>
        <p><strong>Submitted On:</strong> ${new Date(resignation.submittedOn).toLocaleString()}</p>
      </div>
    </div>
  `
  
  // Show the modal
  const modalView = new bootstrap.Modal(document.getElementById('viewResignationModal'))
  modalView.show()
}
/* END RESIGNATION FUNCTIONALITY */