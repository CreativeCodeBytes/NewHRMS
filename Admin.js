// Toggle Sidebar
document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("wrapper")
  const toggleButton = document.getElementById("menu-toggle")

  toggleButton.onclick = () => {
    el.classList.toggle("toggled")
  }

  // Initialize active menu item
  const menuItems = document.querySelectorAll(".list-group-item")
  menuItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      menuItems.forEach((el) => el.classList.remove("active"))
      this.classList.add("active")
    })
  })

  // Navigation between sections
  document.getElementById("dashboardLink").addEventListener("click", (e) => {
    e.preventDefault()
    showSection("dashboardContent")
  })

  document.getElementById("employeeLink").addEventListener("click", (e) => {
    e.preventDefault()
    showSection("employeeContent")
  })

  document.getElementById("userAccessLink").addEventListener("click", (e) => {
    e.preventDefault()
    showSection("userAccessContent")
  })

  document.getElementById("attendanceLink").addEventListener("click", (e) => {
    e.preventDefault()
    showSection("attendanceContent")
  })

  document.getElementById("leaveLink").addEventListener("click", (e) => {
    e.preventDefault()
    showSection("leaveContent")
  })

  document.getElementById("payrollLink").addEventListener("click", (e) => {
    e.preventDefault()
    showSection("payrollContent")
  })


  document.getElementById("resignationLink").addEventListener("click", (e) => {
    e.preventDefault()
    showSection("adminResignationRecords")
  })


  document.getElementById("reportsLink").addEventListener("click", (e) => {
    e.preventDefault()
    showSection("reportsContent")
  })

  // Initialize Dashboard Charts
  initializeCharts()

  

  // Initialize Employee Search
  if (document.getElementById("employeeSearch")) {
    document.getElementById("employeeSearch").addEventListener("input", function () {
      filterEmployees(this.value)
    })
  }

  // Initialize Department Filter
  if (document.getElementById("departmentFilter")) {
    document.getElementById("departmentFilter").addEventListener("change", function () {
      filterEmployeesByDepartment(this.value)
    })
  }

  // Multi-step form navigation
  if (document.getElementById("nextToJob")) {
    document.getElementById("nextToJob").addEventListener("click", () => {
      document.getElementById("job-tab").click()
    })
  }

  if (document.getElementById("backToPersonal")) {
    document.getElementById("backToPersonal").addEventListener("click", () => {
      document.getElementById("personal-tab").click()
    })
  }

  if (document.getElementById("nextToContact")) {
    document.getElementById("nextToContact").addEventListener("click", () => {
      document.getElementById("contact-tab").click()
    })
  }

  if (document.getElementById("backToJob")) {
    document.getElementById("backToJob").addEventListener("click", () => {
      document.getElementById("job-tab").click()
    })
  }

  // Add Employee button
  if (document.getElementById("addEmployeeBtn")) {
    document.getElementById("addEmployeeBtn").addEventListener("click", () => {
      addNewEmployee()
    })
  }

  // ===== ACTION BUTTONS SETUP =====
  
  // Employee Management Action Buttons
  setupEmployeeActionButtons()
  
  // User Access Control Action Buttons
  setupUserAccessActionButtons()
  
  // Attendance Management Action Buttons
  setupAttendanceActionButtons()
  
  // Leave Management Action Buttons
  setupLeaveActionButtons()
  
  // Payroll Management Action Buttons
  setupPayrollActionButtons()

  // Reports Action Buttons
  setupReportsActionButtons()
  
  // Dashboard Action Buttons
  setupDashboardActionButtons()
  
  // Direct action buttons (not in tables)
  setupDirectActionButtons()
})

// Function to set up Employee Action Buttons
function setupEmployeeActionButtons() {
  // Direct action on employee table buttons
  document.querySelectorAll("#employeeTableBody .btn").forEach(button => {
    button.addEventListener("click", function(e) {
      e.preventDefault()
      const row = this.closest("tr")
      if (!row) return
      
      const employeeId = row.querySelector("td:first-child")?.textContent
      const employeeName = row.querySelector("td:nth-child(2)")?.textContent
      
      if (this.classList.contains("btn-info")) {
        // View employee
        alert(`Viewing details for employee: ${employeeName}`)
      } else if (this.classList.contains("btn-warning")) {
        // Edit employee
        alert(`Editing employee: ${employeeName}`)
      } else if (this.classList.contains("btn-danger")) {
        // Deactivate employee
        if (confirm(`Are you sure you want to deactivate ${employeeName}?`)) {
          const statusBadge = row.querySelector(".badge")
          if (statusBadge) {
            statusBadge.className = "badge bg-danger"
            statusBadge.textContent = "Inactive"
          }
        }
      }
    })
  })
}



















function displayAdminResignations() {
  const resignations = JSON.parse(localStorage.getItem("resignations") || "[]");
  const adminResignationTableBody = document.getElementById("adminResignationTableBody");

  if (!adminResignationTableBody) return;

  adminResignationTableBody.innerHTML = "";

  if (resignations.length === 0) {
      const row = document.createElement("tr");
      row.innerHTML = `<td colspan="5" class="text-center">No resignation records found</td>`;
      adminResignationTableBody.appendChild(row);
      return;
  }

  resignations.forEach((record) => {
      const row = document.createElement("tr");
      row.innerHTML = `
          <td>${record.fullName}</td>
          <td>${record.reason || "No reason provided"}</td>
          <td>${record.lastWorkingDay ? new Date(record.lastWorkingDay).toLocaleDateString() : "N/A"}</td>
          <td><span class="badge bg-${record.status === "Approved" ? "success" : record.status === "Rejected" ? "danger" : "warning"}">${record.status}</span></td>
          <td>
              <button class="btn btn-primary btn-sm view-btn" data-id="${record.id}">View</button>
              <button class="btn btn-success btn-sm approve-btn" data-id="${record.id}">Approve</button>
              <button class="btn btn-danger btn-sm reject-btn" data-id="${record.id}">Reject</button>
          </td>
      `;
      adminResignationTableBody.appendChild(row);
  });

  // ✅ Event Listeners for View, Approve, Reject Buttons
  document.querySelectorAll(".view-btn").forEach(button => {
      button.addEventListener("click", (e) => showResignationDetails(e.target.getAttribute("data-id")));
  });

  document.querySelectorAll(".approve-btn").forEach(button => {
      button.addEventListener("click", (e) => updateResignationStatus(e.target.getAttribute("data-id"), "Approved"));
  });

  document.querySelectorAll(".reject-btn").forEach(button => {
      button.addEventListener("click", (e) => updateResignationStatus(e.target.getAttribute("data-id"), "Rejected"));
  });
}

// ✅ Function to Show Resignation Details in Modal
function showResignationDetails(id) {
  const resignations = JSON.parse(localStorage.getItem("resignations") || "[]");
  const record = resignations.find(r => r.id === id);

  if (!record) {
      alert("Resignation record not found!");
      return;
  }

  const resignationDetailsBody = document.getElementById("resignationDetailsBody");
  resignationDetailsBody.innerHTML = `
      <tr><td><strong>Name:</strong></td><td>${record.fullName}</td></tr>
      <tr><td><strong>Employee ID:</strong></td><td>${record.employeeId}</td></tr>
      <tr><td><strong>Department:</strong></td><td>${record.department}</td></tr>
      <tr><td><strong>Designation:</strong></td><td>${record.designation}</td></tr>
      <tr><td><strong>Date of Joining:</strong></td><td>${record.dateOfJoining ? new Date(record.dateOfJoining).toLocaleDateString() : "N/A"}</td></tr>
      <tr><td><strong>Last Working Day:</strong></td><td>${record.lastWorkingDay ? new Date(record.lastWorkingDay).toLocaleDateString() : "N/A"}</td></tr>
      <tr><td><strong>Reason:</strong></td><td>${record.reason || "No reason provided"}</td></tr>
      <tr><td><strong>Notice Period Served:</strong></td><td>${record.noticePeriodServed ? "Yes" : "No"}</td></tr>
      <tr><td><strong>Feedback:</strong></td><td>${record.feedback || "N/A"}</td></tr>
      <tr><td><strong>Suggestions:</strong></td><td>${record.suggestions || "N/A"}</td></tr>
      <tr><td><strong>Status:</strong></td><td><span class="badge bg-${record.status === "Approved" ? "success" : record.status === "Rejected" ? "danger" : "warning"}">${record.status}</span></td></tr>
      <tr><td><strong>Submitted On:</strong></td><td>${record.submittedOn ? new Date(record.submittedOn).toLocaleString() : "N/A"}</td></tr>
  `;

  // ✅ Open Bootstrap Modal Properly
  const modal = new bootstrap.Modal(document.getElementById("viewResignationModal"));
  modal.show();
}

// ✅ Function to Update Resignation Status (Approve/Reject)
function updateResignationStatus(id, status) {
  let resignations = JSON.parse(localStorage.getItem("resignations") || "[]");
  const index = resignations.findIndex(r => r.id === id);

  if (index !== -1) {
      resignations[index].status = status;
      localStorage.setItem("resignations", JSON.stringify(resignations));
      displayAdminResignations(); // Refresh admin resignation table
      alert(`Resignation ${status} successfully!`);
  }
}

// ✅ Call this function when the admin page loads
document.addEventListener("DOMContentLoaded", displayAdminResignations);
















// Function to set up User Access Action Buttons
function setupUserAccessActionButtons() {
  // Role management buttons
  document.querySelectorAll("#roles .btn").forEach(button => {
    button.addEventListener("click", function(e) {
      e.preventDefault()
      const row = this.closest("tr")
      if (!row) return
      
      const roleName = row.querySelector("td:first-child")?.textContent
      
      if (this.classList.contains("btn-info")) {
        // View role
        alert(`Viewing details for role: ${roleName}`)
      } else if (this.classList.contains("btn-warning")) {
        // Edit role
        alert(`Editing role: ${roleName}`)
      } else if (this.classList.contains("btn-danger")) {
        // Delete role
        if (confirm(`Are you sure you want to delete the role: ${roleName}?`)) {
          row.remove()
        }
      }
    })
  })
  
  // Save permissions button
  const savePermissionsBtn = document.querySelector(".permission-groups .btn-primary")
  if (savePermissionsBtn) {
    savePermissionsBtn.addEventListener("click", function(e) {
      e.preventDefault()
      const roleId = document.getElementById("rolePermissionSelect")?.value || "1"
      updatePermissions(roleId)
    })
  }
  
  // Save role assignments button
  const saveRoleAssignmentsBtn = document.querySelector("#user-roles .btn-primary")
  if (saveRoleAssignmentsBtn) {
    saveRoleAssignmentsBtn.addEventListener("click", function(e) {
      e.preventDefault()
      alert("Role assignments saved successfully!")
    })
  }
}

// Function to set up Attendance Action Buttons
function setupAttendanceActionButtons() {
  // Attendance edit buttons
  document.querySelectorAll("#attendanceContent .btn-warning").forEach(button => {
    button.addEventListener("click", function(e) {
      e.preventDefault()
      const row = this.closest("tr")
      if (!row) return
      
      const employeeId = row.querySelector("td:first-child")?.textContent
      const employeeName = row.querySelector("td:nth-child(2)")?.textContent
      const date = row.querySelector("td:nth-child(4)")?.textContent
      
      alert(`Editing attendance record for ${employeeName} on ${date}`)
    })
  })
  
  // Export Excel button
  const exportExcelBtn = document.querySelector("#attendanceContent .btn-success")
  if (exportExcelBtn) {
    exportExcelBtn.addEventListener("click", function(e) {
      e.preventDefault()
      alert("Attendance data exported to Excel successfully!")
    })
  }
  
  // Manual Entry button
  const manualEntryBtn = document.querySelector("#attendanceContent .btn-primary")
  if (manualEntryBtn && !manualEntryBtn.closest(".col-md-2")) {
    manualEntryBtn.addEventListener("click", function(e) {
      e.preventDefault()
      alert("Manual attendance entry form opened.")
    })
  }
  
  // Apply Filters button
  const applyFiltersBtn = document.querySelector("#attendanceContent .col-md-2 .btn-primary")
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener("click", function(e) {
      e.preventDefault()
      alert("Attendance filters applied.")
    })
  }

  // Load and display employee attendance records with selfies
  document.addEventListener("DOMContentLoaded", function() {
    // Check if we're on the attendance page and load the data
    document.getElementById("attendanceLink").addEventListener("click", function() {
      loadEmployeeAttendanceRecords();
    });
  });

  // Function to load employee attendance records from localStorage
  function loadEmployeeAttendanceRecords() {
    const attendanceRecords = JSON.parse(localStorage.getItem("attendance") || "[]");
    const attendanceTableBody = document.querySelector("#attendanceContent .table tbody");
    
    if (!attendanceTableBody) return;
    
    // Clear existing records
    attendanceTableBody.innerHTML = "";
    
    // Group attendance records by pairs (punch in and punch out)
    for (let i = 0; i < attendanceRecords.length; i += 2) {
      if (i + 1 < attendanceRecords.length) {
        const punchInRecord = attendanceRecords[i];
        const punchOutRecord = attendanceRecords[i + 1];
        
        // Calculate working hours
        const punchInTime = new Date(punchInRecord.time);
        const punchOutTime = new Date(punchOutRecord.time);
        const timeDiff = punchOutTime - punchInTime;
        const hours = Math.floor(timeDiff / 3600000);
        const minutes = Math.floor((timeDiff % 3600000) / 60000);
        const workingHours = `${hours}h ${minutes}m`;
        
        // Create a new row
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>EMP${1000 + i/2}</td>
          <td>Employee ${1000 + i/2}</td>
          <td>IT</td>
          <td>${new Date(punchInRecord.time).toLocaleDateString()}</td>
          <td>${new Date(punchInRecord.time).toLocaleTimeString()}</td>
          <td>${new Date(punchOutRecord.time).toLocaleTimeString()}</td>
          <td><span class="badge bg-success">Present</span></td>
          <td>${workingHours}</td>
          <td>
            <button class="btn btn-sm btn-info view-attendance" data-bs-toggle="modal" data-bs-target="#viewAttendanceModal" data-index="${i}">
              <i class="fas fa-eye"></i>
            </button>
          </td>
        `;
        
        attendanceTableBody.appendChild(row);
      }
    }
    
    // Add event listeners to view buttons
    document.querySelectorAll(".view-attendance").forEach(button => {
      button.addEventListener("click", function() {
        const index = parseInt(this.getAttribute("data-index"));
        showAttendanceDetails(index);
      });
    });
  }

  // Function to show attendance details in modal
  function showAttendanceDetails(index) {
    const attendanceRecords = JSON.parse(localStorage.getItem("attendance") || "[]");
    
    if (index >= 0 && index + 1 < attendanceRecords.length) {
      const punchInRecord = attendanceRecords[index];
      const punchOutRecord = attendanceRecords[index + 1];
      
      // Get modal elements
      const modalBody = document.getElementById("attendanceDetailsBody");
      if (!modalBody) return;
      
      // Calculate working hours
      const punchInTime = new Date(punchInRecord.time);
      const punchOutTime = new Date(punchOutRecord.time);
      const timeDiff = punchOutTime - punchInTime;
      const hours = Math.floor(timeDiff / 3600000);
      const minutes = Math.floor((timeDiff % 3600000) / 60000);
      const workingHours = `${hours}h ${minutes}m`;
      
      // Update modal content
      modalBody.innerHTML = `
        <div class="row">
          <div class="col-md-6">
            <h6>Punch In Details</h6>
            <p><strong>Date:</strong> ${new Date(punchInRecord.time).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${new Date(punchInRecord.time).toLocaleTimeString()}</p>
            <div class="text-center mb-3">
              <img src="${punchInRecord.imageDataUrl}" alt="Punch In Selfie" class="img-fluid rounded" style="max-height: 200px;">
            </div>
          </div>
          <div class="col-md-6">
            <h6>Punch Out Details</h6>
            <p><strong>Date:</strong> ${new Date(punchOutRecord.time).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${new Date(punchOutRecord.time).toLocaleTimeString()}</p>
            <div class="text-center mb-3">
              <img src="${punchOutRecord.imageDataUrl}" alt="Punch Out Selfie" class="img-fluid rounded" style="max-height: 200px;">
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <p><strong>Total Working Hours:</strong> ${workingHours}</p>
          </div>
        </div>
      `;
    }
  }
}

// Function to set up Leave Action Buttons
function setupLeaveActionButtons() {
  // Leave approval buttons
  document.querySelectorAll("#leaveContent .btn-success").forEach(button => {
    if (button.querySelector(".fas.fa-check")) {
      button.addEventListener("click", function(e) {
        e.preventDefault()
        const row = this.closest("tr")
        if (!row) return
        
        const employeeName = row.querySelector("td:first-child")?.textContent
        const leaveId = "leave-" + Math.floor(Math.random() * 1000) // Simulating a leave ID
        
        approveLeave(leaveId)
        alert(`Leave request for ${employeeName} has been approved`)
        
        // Update UI
        const statusCell = row.querySelector("td:last-child")
        if (statusCell) {
          statusCell.innerHTML = '<span class="badge bg-success">Approved</span>'
        }
      })
    }
  })
  
  // Leave rejection buttons
  document.querySelectorAll("#leaveContent .btn-danger").forEach(button => {
    if (button.querySelector(".fas.fa-times")) {
      button.addEventListener("click", function(e) {
        e.preventDefault()
        const row = this.closest("tr")
        if (!row) return
        
        const employeeName = row.querySelector("td:first-child")?.textContent
        const leaveId = "leave-" + Math.floor(Math.random() * 1000) // Simulating a leave ID
        
        rejectLeave(leaveId)
        alert(`Leave request for ${employeeName} has been rejected`)
        
        // Update UI
        const statusCell = row.querySelector("td:last-child")
        if (statusCell) {
          statusCell.innerHTML = '<span class="badge bg-danger">Rejected</span>'
        }
      })
    }
  })
  
  // Leave tab navigation
  document.querySelectorAll("#leaveContent .nav-link").forEach(tab => {
    tab.addEventListener("click", function(e) {
      e.preventDefault()
      const tabId = this.getAttribute("data-bs-target")?.substring(1)
      if (!tabId) return
      
      // Remove active class from all tabs and panes
      document.querySelectorAll("#leaveContent .nav-link").forEach(t => t.classList.remove("active"))
      document.querySelectorAll("#leaveContent .tab-pane").forEach(p => p.classList.remove("show", "active"))
      
      // Add active class to clicked tab and corresponding pane
      this.classList.add("active")
      const pane = document.getElementById(tabId)
      if (pane) {
        pane.classList.add("show", "active")
      }
    })
  })
}

// Function to set up Payroll Action Buttons
function setupPayrollActionButtons() {
  // Salary structure view buttons
  document.querySelectorAll("#salaries .btn-info").forEach(button => {
    button.addEventListener("click", function(e) {
      e.preventDefault()
      const row = this.closest("tr")
      if (!row) return
      
      const employeeName = row.querySelector("td:nth-child(2)")?.textContent
      alert(`Viewing salary details for ${employeeName}`)
    })
  })
  
  // Salary structure edit buttons
  document.querySelectorAll("#salaries .btn-warning").forEach(button => {
    button.addEventListener("click", function(e) {
      e.preventDefault()
      const row = this.closest("tr")
      if (!row) return
      
      const employeeName = row.querySelector("td:nth-child(2)")?.textContent
      alert(`Editing salary structure for ${employeeName}`)
    })
  })
  
  // Payslip view buttons
  document.querySelectorAll("#payslips .btn-info").forEach(button => {
    button.addEventListener("click", function(e) {
      e.preventDefault()
      const row = this.closest("tr")
      if (!row) return
      
      const employeeName = row.querySelector("td:nth-child(2)")?.textContent
      alert(`Viewing payslip for ${employeeName}`)
    })
  })
  
  // Payslip download buttons
  document.querySelectorAll("#payslips .btn-primary").forEach(button => {
    button.addEventListener("click", function(e) {
      e.preventDefault()
      const row = this.closest("tr")
      if (!row) return
      
      const employeeId = row.querySelector("td:first-child")?.textContent
      const month = row.querySelector("td:nth-child(4)")?.textContent
      downloadPayslip(employeeId, month, "2025")
    })
  })
  
  // Payslip email buttons
  document.querySelectorAll("#payslips .btn-success").forEach(button => {
    if (button.querySelector(".fas.fa-envelope")) {
      button.addEventListener("click", function(e) {
        e.preventDefault()
        const row = this.closest("tr")
        if (!row) return
        
        const employeeId = row.querySelector("td:first-child")?.textContent
        const month = row.querySelector("td:nth-child(4)")?.textContent
        emailPayslip(employeeId, month, "2025")
      })
    }
  })
  
  // Generate Payslips button
  const generatePayslipsBtn = document.querySelector("[data-bs-target='#generatePayslipsModal']")
  if (generatePayslipsBtn) {
    generatePayslipsBtn.addEventListener("click", function(e) {
      // This just opens the modal, we'll handle the actual generation in the modal
      console.log("Opening generate payslips modal")
    })
  }
  
  // Payroll tab navigation
  document.querySelectorAll("#payrollTabs .nav-link").forEach(tab => {
    tab.addEventListener("click", function(e) {
      e.preventDefault()
      const tabId = this.getAttribute("data-bs-target")?.substring(1)
      if (!tabId) return
      
      // Remove active class from all tabs and panes
      document.querySelectorAll("#payrollTabs .nav-link").forEach(t => t.classList.remove("active"))
      document.querySelectorAll("#payrollTabsContent .tab-pane").forEach(p => p.classList.remove("show", "active"))
      
      // Add active class to clicked tab and corresponding pane
      this.classList.add("active")
      const pane = document.getElementById(tabId)
      if (pane) {
        pane.classList.add("show", "active")
      }
    })
  })
  
  // Export button
  const exportBtn = document.querySelector("#payrollContent .btn-success")
  if (exportBtn && exportBtn.textContent.includes("Export")) {
    exportBtn.addEventListener("click", function(e) {
      e.preventDefault()
      alert("Payroll data exported successfully!")
    })
  }
}

// Function to set up Reports Action Buttons
function setupReportsActionButtons() {
  // Report generation buttons
  document.querySelectorAll("[data-bs-toggle='modal'][data-bs-target$='ReportModal']").forEach(button => {
    button.addEventListener("click", function(e) {
      e.preventDefault()
      const reportType = this.closest(".card").querySelector(".card-title")?.textContent.toLowerCase().split(" ")[0]
      console.log(`Opening ${reportType} report modal`)
    })
  })
  
  // Export Report button
  const exportReportBtn = document.querySelector("#reportsContent .btn-success")
  if (exportReportBtn && exportReportBtn.textContent.includes("Export Report")) {
    exportReportBtn.addEventListener("click", function(e) {
      e.preventDefault()
      alert("Report exported successfully!")
    })
  }
  
  // Report download buttons (added dynamically after report generation)
  document.addEventListener("click", function(e) {
    if (e.target.matches("#reportContent .btn-primary") || e.target.closest("#reportContent .btn-primary")) {
      e.preventDefault()
      const reportType = document.querySelector("#reportContent h4")?.textContent.split("-")[0].trim().toLowerCase() || "report"
      downloadReportPDF(reportType)
    } else if (e.target.matches("#reportContent .btn-success") || e.target.closest("#reportContent .btn-success")) {
      e.preventDefault()
      const reportType = document.querySelector("#reportContent h4")?.textContent.split("-")[0].trim().toLowerCase() || "report"
      downloadReportExcel(reportType)
    }
  })
}

// Function to set up Dashboard Action Buttons
function setupDashboardActionButtons() {
  // Review buttons in pending approvals
  document.querySelectorAll("#dashboardContent .list-group-item .btn-outline-primary").forEach(button => {
    button.addEventListener("click", function(e) {
      e.preventDefault()
      const approvalType = this.closest(".list-group-item").querySelector("strong")?.textContent
      alert(`Reviewing ${approvalType}`)
    })
  })
  
  // Create Announcement button
  const createAnnouncementBtn = document.querySelector(".announcement-item + .text-center .btn-primary")
  if (createAnnouncementBtn) {
    createAnnouncementBtn.addEventListener("click", function(e) {
      e.preventDefault()
      alert("Create new announcement form opened.")
    })
  }
}

// Function to set up Direct Action Buttons (not in tables)
function setupDirectActionButtons() {
  // Add Role button
  const addRoleBtn = document.querySelector("[data-bs-target='#addRoleModal']")
  if (addRoleBtn) {
    addRoleBtn.addEventListener("click", function(e) {
      console.log("Opening add role modal")
    })
  }
  
  // Add Deduction button
  const addDeductionBtn = document.querySelector("[data-bs-target='#addDeductionModal']")
  if (addDeductionBtn) {
    addDeductionBtn.addEventListener("click", function(e) {
      console.log("Opening add deduction modal")
    })
  }
  
  // Add Bonus button
  const addBonusBtn = document.querySelector("[data-bs-target='#addBonusModal']")
  if (addBonusBtn) {
    addBonusBtn.addEventListener("click", function(e) {
      console.log("Opening add bonus modal")
    })
  }
  
  // Add Individual Bonus button
  const addIndividualBonusBtn = document.querySelector("[data-bs-target='#addIndividualBonusModal']")
  if (addIndividualBonusBtn) {
    addIndividualBonusBtn.addEventListener("click", function(e) {
      console.log("Opening add individual bonus modal")
    })
  }
  
  // Save Changes button in deductions
  const saveDeductionsBtn = document.querySelector("#deductions form .btn-primary")
  if (saveDeductionsBtn) {
    saveDeductionsBtn.addEventListener("click", function(e) {
      e.preventDefault()
      alert("Deduction changes saved successfully!")
    })
  }
}

// Function to show the selected section and hide others
function showSection(sectionId) {
  const sections = [
    "dashboardContent",
    "employeeContent",
    "userAccessContent",
    "attendanceContent",
    "leaveContent",
    "payrollContent",
    "reportsContent",
    "adminResignationRecords",
    
  ]

  sections.forEach((section) => {
    const element = document.getElementById(section)
    if (element) {
      if (section === sectionId) {
        element.style.display = "block"
      } else {
        element.style.display = "none"
      }
    }
  })
}

// Initialize Charts
function initializeCharts() {
  // Performance Chart
  if (document.getElementById("performanceChart")) {
    const performanceCtx = document.getElementById("performanceChart").getContext("2d")
    const performanceChart = new Chart(performanceCtx, {
      type: "line",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
          {
            label: "IT Department",
            data: [85, 87, 84, 86, 92, 95],
            backgroundColor: "rgba(78, 115, 223, 0.05)",
            borderColor: "rgba(78, 115, 223, 1)",
            borderWidth: 2,
            pointBackgroundColor: "rgba(78, 115, 223, 1)",
            pointRadius: 3,
            tension: 0.3,
          },
          {
            label: "HR Department",
            data: [80, 82, 83, 85, 87, 90],
            backgroundColor: "rgba(28, 200, 138, 0.05)",
            borderColor: "rgba(28, 200, 138, 1)",
            borderWidth: 2,
            pointBackgroundColor: "rgba(28, 200, 138, 1)",
            pointRadius: 3,
            tension: 0.3,
          },
          {
            label: "Finance Department",
            data: [75, 78, 80, 82, 85, 88],
            backgroundColor: "rgba(54, 185, 204, 0.05)",
            borderColor: "rgba(54, 185, 204, 1)",
            borderWidth: 2,
            pointBackgroundColor: "rgba(54, 185, 204, 1)",
            pointRadius: 3,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: "Department Performance Trend (2025)",
            font: {
              size: 16,
            },
          },
          legend: {
            position: "bottom",
          },
          tooltip: {
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            titleColor: "#6e707e",
            bodyColor: "#6e707e",
            bodyFont: {
              size: 14,
            },
            borderWidth: 1,
            borderColor: "#e3e6f0",
          },
        },
        scales: {
          y: {
            beginAtZero: false,
            min: 70,
            max: 100,
            ticks: {
              stepSize: 5,
            },
            title: {
              display: true,
              text: "Performance Score (%)",
            },
          },
        },
      },
    })
  }

  // Attendance Chart
  if (document.getElementById("attendanceChart")) {
    const attendanceCtx = document.getElementById("attendanceChart").getContext("2d")
    const attendanceChart = new Chart(attendanceCtx, {
      type: "bar",
      data: {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        datasets: [
          {
            label: "Present",
            data: [135, 130, 140, 138],
            backgroundColor: "rgba(28, 200, 138, 0.8)",
            borderColor: "rgba(28, 200, 138, 1)",
            borderWidth: 1,
          },
          {
            label: "Late",
            data: [5, 8, 3, 4],
            backgroundColor: "rgba(246, 194, 62, 0.8)",
            borderColor: "rgba(246, 194, 62, 1)",
            borderWidth: 1,
          },
          {
            label: "WFH",
            data: [0, 2, 5, 2],
            backgroundColor: "rgba(54, 185, 204, 0.8)",
            borderColor: "rgba(54, 185, 204, 1)",
            borderWidth: 1,
          },
          {
            label: "Absent",
            data: [2, 2, 1, 3],
            backgroundColor: "rgba(231, 74, 59, 0.8)",
            borderColor: "rgba(231, 74, 59, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: "June 2025 Attendance",
            font: {
              size: 16,
            },
          },
          legend: {
            position: "bottom",
          },
        },
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
            title: {
              display: true,
              text: "Number of Employees",
            },
          },
        },
      },
    })
  }

  // Department Performance Chart
  if (document.getElementById("departmentPerformanceChart")) {
    const deptCtx = document.getElementById("departmentPerformanceChart").getContext("2d")
    const deptChart = new Chart(deptCtx, {
      type: "radar",
      data: {
        labels: ["Productivity", "Quality", "Teamwork", "Innovation", "Timeliness"],
        datasets: [
          {
            label: "IT Department",
            data: [90, 85, 88, 94, 82],
            backgroundColor: "rgba(78, 115, 223, 0.2)",
            borderColor: "rgba(78, 115, 223, 1)",
            borderWidth: 2,
            pointBackgroundColor: "rgba(78, 115, 223, 1)",
          },
          {
            label: "HR Department",
            data: [85, 88, 92, 80, 86],
            backgroundColor: "rgba(28, 200, 138, 0.2)",
            borderColor: "rgba(28, 200, 138, 1)",
            borderWidth: 2,
            pointBackgroundColor: "rgba(28, 200, 138, 1)",
          },
          {
            label: "Finance Department",
            data: [82, 95, 83, 78, 90],
            backgroundColor: "rgba(54, 185, 204, 0.2)",
            borderColor: "rgba(54, 185, 204, 1)",
            borderWidth: 2,
            pointBackgroundColor: "rgba(54, 185, 204, 1)",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: {
              display: true,
            },
            suggestedMin: 50,
            suggestedMax: 100,
          },
        },
        plugins: {
          legend: {
            position: "bottom",
          },
        },
      },
    })
  }
}

// Employee Management Functions
function filterEmployees(searchTerm) {
  searchTerm = searchTerm.toLowerCase()
  const rows = document.querySelectorAll("#employeeTableBody tr")

  rows.forEach((row) => {
    const name = row.querySelector("td:nth-child(2)").textContent.toLowerCase()
    const email = row.querySelector("td:nth-child(5)").textContent.toLowerCase()
    const dept = row.querySelector("td:nth-child(3)").textContent.toLowerCase()
    const designation = row.querySelector("td:nth-child(4)").textContent.toLowerCase()

    if (
      name.includes(searchTerm) ||
      email.includes(searchTerm) ||
      dept.includes(searchTerm) ||
      designation.includes(searchTerm)
    ) {
      row.style.display = ""
    } else {
      row.style.display = "none"
    }
  })
}

function filterEmployeesByDepartment(department) {
  const rows = document.querySelectorAll("#employeeTableBody tr")

  rows.forEach((row) => {
    const dept = row.querySelector("td:nth-child(3)").textContent

    if (department === "all" || dept === department) {
      row.style.display = ""
    } else {
      row.style.display = "none"
    }
  })
}

// Function to add a new employee
function addNewEmployee() {
  // Get form data
  const firstName = document.getElementById("firstName").value
  const lastName = document.getElementById("lastName").value
  const employeeId = document.getElementById("employeeId").value
  const department = document.getElementById("department").value
  const designation = document.getElementById("designation").value
  const email = document.getElementById("email").value

  if (!firstName || !lastName || !employeeId || !department || !designation || !email) {
    alert("Please fill all required fields")
    return
  }

  // Create new employee row
  const tableBody = document.getElementById("employeeTableBody")
  const newRow = document.createElement("tr")
  newRow.innerHTML = `
      <td>${employeeId}</td>
      <td>${firstName} ${lastName}</td>
      <td>${department}</td>
      <td>${designation}</td>
      <td>${email}</td>
      <td><span class="badge bg-success">Active</span></td>
      <td>
        <div class="btn-group btn-group-sm">
          <button type="button" class="btn btn-info">
            <i class="fas fa-eye"></i>
          </button>
          <button type="button" class="btn btn-warning">
            <i class="fas fa-edit"></i>
          </button>
          <button type="button" class="btn btn-danger">
            <i class="fas fa-user-slash"></i>
          </button>
        </div>
      </td>
    `

  // Add the new row to the table
  tableBody.appendChild(newRow)

  // Show the employee table and pagination, hide the empty state
  const emptyState = document.getElementById("employeeTableEmpty")
  const pagination = document.getElementById("employeePagination")

  if (emptyState) {
    emptyState.style.display = "none"
  }

  if (pagination) {
    pagination.style.display = "block"
  }

  // Close the modal
  const modalElement = document.getElementById("addEmployeeModal")
  // Access bootstrap through the window object
  const modal = window.bootstrap.Modal.getInstance(modalElement)
  if (modal) {
    modal.hide()
  } else {
    // Fallback if bootstrap modal instance isn't available
    modalElement.classList.remove('show')
    modalElement.style.display = 'none'
    document.body.classList.remove('modal-open')
    const modalBackdrops = document.getElementsByClassName('modal-backdrop')
    if (modalBackdrops.length > 0) {
      document.body.removeChild(modalBackdrops[0])
    }
  }

  // Reset form
  document.getElementById("addEmployeeForm").reset()

  // Show success message
  alert("Employee added successfully!")

  // Ensure first tab is active for next time
  document.getElementById("personal-tab").click()
  
  // Add event listeners to the new buttons
  setupEmployeeActionButtons()
}

// Role Management Functions
function updatePermissions(roleId) {
  // API call to update permissions
  console.log("Updating permissions for role ID: " + roleId)
  // Show success message
  alert("Permissions updated successfully!")
}

// Leave Management Functions
function approveLeave(leaveId) {
  // API call to approve leave
  console.log("Approving leave ID: " + leaveId)
  // Update UI
  const statusBadge = document.querySelector(`#leave-${leaveId} .badge`)
  if (statusBadge) {
    statusBadge.className = "badge bg-success"
    statusBadge.textContent = "Approved"
  }
}

function rejectLeave(leaveId) {
  // API call to reject leave
  console.log("Rejecting leave ID: " + leaveId)
  // Update UI
  const statusBadge = document.querySelector(`#leave-${leaveId} .badge`)
  if (statusBadge) {
    statusBadge.className = "badge bg-danger"
    statusBadge.textContent = "Rejected"
  }
}

// Payroll Functions
function generatePayslips(month, year) {
  // API call to generate payslips
  console.log(`Generating payslips for ${month} ${year}`)
  // Show success message after API response
  setTimeout(() => {
    alert(`Payslips for ${month} ${year} generated successfully!`)
    // Refresh payslips table
    showSection("payrollContent")
  }, 1500)
}

function downloadPayslip(employeeId, month, year) {
  // API call to download payslip
  console.log(`Downloading payslip for Employee ID: ${employeeId}, ${month} ${year}`)
  // Simulate download
  const link = document.createElement("a")
  link.href = `#`
  link.setAttribute("download", `payslip_${employeeId}_${month}_${year}.pdf`)
  link.click()
}

function emailPayslip(employeeId, month, year) {
  // API call to email payslip
  console.log(`Emailing payslip to Employee ID: ${employeeId}, ${month} ${year}`)
  // Show success message
  alert(`Payslip emailed successfully to employee!`)
}

// Reports Functions
function generateReport(reportType, dateRange) {
  // API call to generate report
  console.log(`Generating ${reportType} report for ${dateRange}`)
  // Show loading indicator
  document.getElementById("reportContent").innerHTML =
    '<div class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div><p class="mt-2">Generating report, please wait...</p></div>'

  // Simulate API delay
  setTimeout(() => {
    // Update UI with report data
    let reportContent = ""
    switch (reportType) {
      case "employee":
        reportContent = generateEmployeeReport(dateRange)
        break
      case "attendance":
        reportContent = generateAttendanceReport(dateRange)
        break
      case "payroll":
        reportContent = generatePayrollReport(dateRange)
        break
      case "performance":
        reportContent = generatePerformanceReport(dateRange)
        break
      default:
        reportContent = '<div class="alert alert-warning">Report type not supported.</div>'
    }

    document.getElementById("reportContent").innerHTML = reportContent
    
    // Add event listeners to the newly created download buttons
    setupReportsActionButtons()
  }, 2000)
}

function generateEmployeeReport(dateRange) {
  return `
      <h4 class="mb-3">Employee Report - ${dateRange}</h4>
      <div class="table-responsive">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Department</th>
              <th>Total Employees</th>
              <th>Active</th>
              <th>Inactive</th>
              <th>New Hires</th>
              <th>Terminations</th>
              <th>Turnover Rate</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>IT</td>
              <td>45</td>
              <td>42</td>
              <td>3</td>
              <td>5</td>
              <td>2</td>
              <td>4.4%</td>
            </tr>
            <tr>
              <td>HR</td>
              <td>15</td>
              <td>15</td>
              <td>0</td>
              <td>2</td>
              <td>0</td>
              <td>0%</td>
            </tr>
            <tr>
              <td>Finance</td>
              <td>20</td>
              <td>18</td>
              <td>2</td>
              <td>1</td>
              <td>1</td>
              <td>5%</td>
            </tr>
            <tr>
              <td>Marketing</td>
              <td>25</td>
              <td>24</td>
              <td>1</td>
              <td>3</td>
              <td>1</td>
              <td>4%</td>
            </tr>
            <tr>
              <td>Operations</td>
              <td>37</td>
              <td>35</td>
              <td>2</td>
              <td>4</td>
              <td>2</td>
              <td>5.4%</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="fw-bold">
              <td>Total</td>
              <td>142</td>
              <td>134</td>
              <td>8</td>
              <td>15</td>
              <td>6</td>
              <td>4.2%</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div class="text-end mt-3">
        <button class="btn btn-primary">Download PDF</button>
        <button class="btn btn-success ms-2">Download Excel</button>
      </div>
    `
}

function generateAttendanceReport(dateRange) {
  return `
      <h4 class="mb-3">Attendance Report - ${dateRange}</h4>
      <div class="table-responsive">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Department</th>
              <th>Attendance Rate</th>
              <th>Average Working Hours</th>
              <th>Late Arrivals</th>
              <th>Early Departures</th>
              <th>Absent</th>
              <th>WFH</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>IT</td>
              <td>95.2%</td>
              <td>8.7</td>
              <td>12</td>
              <td>8</td>
              <td>5</td>
              <td>18</td>
            </tr>
            <tr>
              <td>HR</td>
              <td>98.1%</td>
              <td>8.9</td>
              <td>3</td>
              <td>2</td>
              <td>2</td>
              <td>5</td>
            </tr>
            <tr>
              <td>Finance</td>
              <td>97.5%</td>
              <td>9.1</td>
              <td>5</td>
              <td>3</td>
              <td>3</td>
              <td>7</td>
            </tr>
            <tr>
              <td>Marketing</td>
              <td>94.8%</td>
              <td>8.5</td>
              <td>10</td>
              <td>12</td>
              <td>8</td>
              <td>15</td>
            </tr>
            <tr>
              <td>Operations</td>
              <td>96.2%</td>
              <td>8.8</td>
              <td>9</td>
              <td>7</td>
              <td>7</td>
              <td>12</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="fw-bold">
              <td>Overall</td>
              <td>96.4%</td>
              <td>8.8</td>
              <td>39</td>
              <td>32</td>
              <td>25</td>
              <td>57</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div class="text-end mt-3">
        <button class="btn btn-primary">Download PDF</button>
        <button class="btn btn-success ms-2">Download Excel</button>
      </div>
    `
}

// Simulate report download
function downloadReportPDF(reportType) {
  console.log(`Downloading ${reportType} report as PDF`)
  alert(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report has been downloaded as PDF.`)
}

function downloadReportExcel(reportType) {
  console.log(`Downloading ${reportType} report as Excel`)
  alert(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report has been downloaded as Excel.`)
}

function generatePayrollReport(dateRange) {
  return `
      <h4 class="mb-3">Payroll Report - ${dateRange}</h4>
      <div class="table-responsive">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Gross Pay</th>
              <th>Net Pay</th>
              <th>Deductions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1001</td>
              <td>John Doe</td>
              <td>$5000</td>
              <td>$4500</td>
              <td>$500</td>
            </tr>
            <tr>
              <td>1002</td>
              <td>Jane Smith</td>
              <td>$6000</td>
              <td>$5500</td>
              <td>$500</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="text-end mt-3">
        <button class="btn btn-primary">Download PDF</button>
        <button class="btn btn-success ms-2">Download Excel</button>
      </div>
    `
}

function generatePerformanceReport(dateRange) {
  return `
      <h4 class="mb-3">Performance Report - ${dateRange}</h4>
      <div class="table-responsive">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Performance Score</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1001</td>
              <td>John Doe</td>
              <td>90</td>
              <td>Excellent</td>
            </tr>
            <tr>
              <td>1002</td>
              <td>Jane Smith</td>
              <td>85</td>
              <td>Good</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="text-end mt-3">
        <button class="btn btn-primary">Download PDF</button>
        <button class="btn btn-success ms-2">Download Excel</button>
      </div>
    `
}
