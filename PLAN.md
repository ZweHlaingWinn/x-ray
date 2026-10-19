# Project: X-Ray Reporting and Patient Result Portal — Demo Web App

## 1. Project Overview

Build a modern, responsive demo web application for a medical clinic to manage X-ray records, radiologist reports, patient information, and secure patient access to X-ray results using QR codes.

The purpose of this project is to demonstrate the clinic's workflow from storing an X-ray record to allowing patients to view their finalized results online.

This is a demo application. Use mock data and simulated workflows. Do not integrate with real medical equipment, PACS, DICOM servers, or external healthcare systems.

## 2. Main Workflow

Implement the following end-to-end workflow:

1. **X-Ray Record Registration**
   - Create a record for each X-ray examination.
   - Store patient information, examination date, X-ray type, and a reference to the X-ray image or uploaded demo image.
   - Assign a unique examination ID.
   - Allow clinic staff to find records using the examination ID or patient information.
   - Track the examination status.

2. **Radiologist Reporting**
   - Radiologists can view X-ray examination records.
   - Open a record and review the associated demo X-ray image.
   - Enter and save:
     - Clinical findings
     - Radiologist's impression/opinion
     - Recommendations or follow-up notes
     - Radiologist name
     - Report date
   - Allow the radiologist to save a draft and finalize the report.
   - Once finalized, the report should be marked as completed.
   - Display a clear status such as `Pending`, `In Progress`, or `Finalized`.

3. **Clinic Helper Data Entry**
   - Clinic helpers can complete missing patient and examination information.
   - Include patient name, patient ID, date of birth, gender, contact information, examination type, and referring doctor where applicable.
   - Validate required fields before submission.
   - Show which information is missing or incomplete.
   - Clinic helpers must not be able to edit a finalized radiologist report.

4. **Generate Patient QR Code**
   - After the report is finalized and required patient information is complete, allow authorized clinic staff to generate a QR code for the examination.
   - The QR code should open a dedicated patient result page for that examination.
   - Provide options to preview, print, and download the QR code.
   - Display the examination ID and QR code status in the admin dashboard.
   - Each QR code should correspond to the correct examination and report.

5. **Patient Result Portal**
   - Patients can scan the QR code using a smartphone or open the corresponding URL in a browser.
   - Display the finalized X-ray report in a clean, readable layout.
   - Show:
     - Patient name
     - Examination ID
     - Examination date
     - X-ray examination type
     - X-ray image preview, if available
     - Radiologist's findings
     - Impression/opinion
     - Recommendations
     - Radiologist name
     - Report finalization date
   - Make the page mobile-friendly and easy to read.
   - Patients should be able to revisit their results using the QR code without needing to install an application.
   - Do not display draft or unfinished reports.
   - Include a print-friendly report layout.

## 3. User Roles and Permissions

Create three user roles:

### Admin / Clinic Helper
- View and search X-ray records.
- Create examination records.
- Enter and update patient information.
- View report status.
- Generate and print QR codes when the record meets the required conditions.
- Cannot modify finalized radiologist findings or impressions.

### Radiologist
- View assigned or available X-ray records.
- Review X-ray images.
- Create, edit, and save draft reports.
- Finalize reports.
- View previously finalized reports.
- Cannot modify patient access settings or clinic-wide user accounts.

### Patient
- Access a specific finalized report through its QR code.
- View the report and available image previews.
- Print the result.
- Cannot access administrative functions or other patient records.

## 4. Required Demo Pages

Build the following pages:

1. **Login Page**
   - Demo login for each role.
   - Provide quick buttons to enter as Admin/Clinic Helper, Radiologist, or Patient demo user.

2. **Dashboard**
   - Total X-ray examinations.
   - Pending reports.
   - Reports in progress.
   - Finalized reports.
   - QR codes generated.
   - Recent examination activity.

3. **X-Ray Records Page**
   - Searchable and filterable table.
   - Patient name, examination ID, examination type, examination date, assigned radiologist, and status.
   - View details and create new examination actions.

4. **Create/Edit Examination Page**
   - Patient and examination information form.
   - Demo image upload or image selection.
   - Form validation.

5. **Radiologist Worklist**
   - List of examinations awaiting review.
   - Filters by status and examination date.
   - Open an examination to review the image and write the report.

6. **Radiologist Report Editor**
   - X-ray image viewer or large image preview.
   - Findings text area.
   - Impression/opinion text area.
   - Recommendations field.
   - Save Draft and Finalize Report buttons.
   - Confirmation dialog before finalizing.

7. **Patient Information Page**
   - View and complete patient details.
   - Display report status and QR code eligibility.

8. **QR Code Management Page**
   - Generate QR code.
   - Preview the patient result URL.
   - Print or download the QR code.
   - Display QR generation status.

9. **Patient Result Page**
   - Accessible using the QR code URL.
   - Show only finalized reports.
   - Display the examination information and radiologist report.
   - Include print and back-to-home actions where appropriate.

## 5. UI/UX Requirements

Create a professional healthcare dashboard with a modern medical software aesthetic.

- Use a clean, minimal interface.
- Use white backgrounds, subtle gray surfaces, and restrained blue or teal accents.
- Use clear status badges and readable typography.
- Include a sidebar navigation for administrative and radiologist interfaces.
- Use tables, cards, forms, and confirmation dialogs where appropriate.
- Ensure the interface is responsive on desktop, tablet, and mobile.
- Use realistic mock patient and examination data.
- Include loading, empty, success, and error states.
- Provide clear success notifications after saving reports or generating QR codes.
- Make the patient result page visually distinct from the internal dashboard.

## 6. Demo Data and Interactions

Seed the application with at least 10 fictional patient examinations, including:

- Records awaiting radiologist review.
- Reports saved as drafts.
- Finalized reports.
- Records with incomplete patient information.
- Records with QR codes already generated.

Use fictional patient information and sample X-ray images.

All major buttons and interactions must work in the demo. For example:

- Creating an examination adds it to the records table.
- Saving a report updates its status.
- Finalizing a report makes it available on the patient result page.
- Generating a QR code produces a working link to the corresponding patient result.
- Searching and filtering records updates the displayed results.
- Printing opens a print-friendly view.

Persist demo data using the simplest suitable approach for the existing project. If a backend already exists, reuse it. Otherwise, use local mock data or browser storage for the prototype.

## 7. Important Business Rules

- Every X-ray examination must have a unique examination ID.
- A patient may have multiple X-ray examinations.
- Every report must belong to the correct examination.
- A report must be finalized before the patient can view it.
- A QR code must link to the correct examination result.
- Updating patient information must not accidentally change another examination's information.
- Finalized reports must not be silently overwritten.
- If a finalized report requires correction, demonstrate an explicit authorized correction or amendment workflow.
- Use fictional data only.

**Security note for the demo:** QR codes should contain an opaque, unpredictable result token rather than patient details or medical findings. The demo may simulate this behavior, but a production system must implement proper authentication or access controls, HTTPS, access logging, and appropriate protection for sensitive medical data. A QR code alone should not be treated as proof of patient identity.

## 8. Scope and Deliverables

The priority is a working, clickable demo that clearly demonstrates the complete workflow.

Do not overengineer the solution. Do not implement AI diagnosis, automatic X-ray interpretation, billing, appointment booking, real PACS/DICOM integration, or complex system architecture.

Before coding:
1. Inspect the existing project and identify its framework and current structure.
2. Reuse the existing stack and conventions where possible.
3. Implement the UI and working interactions incrementally.
4. Run the application and verify the complete workflow using fictional data.

**Final acceptance criteria:** A user must be able to log in as a clinic helper, create an X-ray examination, complete patient details, log in as a radiologist, write and finalize the report, generate a QR code, and open the corresponding finalized report through the QR code in a patient-facing browser page.