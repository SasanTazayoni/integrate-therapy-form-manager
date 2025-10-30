# Integrate Therapy Form Manager

![HTML](./tech/html.png) ![CSS](./tech/css.png) ![Javascript](./tech/javascript.png) ![Typescript](./tech/typescript.png) ![Vite](./tech/vite.png) ![React](./tech/react.png) ![Jest](./tech/jest.png) ![Tailwind](./tech/tailwind.png) ![REST-API](./tech/restapi.png) ![Prisma](./tech/prisma.png) ![PostgreSQL](./tech/postgresql.png) ![Neon](./tech/neon.png) ![Node](./tech/node.png) ![Express](./tech/express.png) ![ChatGPT](./tech/chatgpt.png) ![VSCode](./tech/vscode.png) ![render](./tech/render.png)

# Introduction

This project was developed for a sole-trader psychotherapist to address a specific business challenge. Previously, the therapist manually sent forms stored in Excel spreadsheets to clients via email. Clients would complete the forms and return them, after which the therapist manually calculated scores based on each client’s responses. Finally, the results were compiled into charts for each questionnaire, which were used to assist in the therapy process during client sessions.

## Problems with the Previous Process

* Some clients submitted partially filled forms.
* Sometimes clients did not fill out the forms at all.
* Some clients altered questions in the form, either accidentally or intentionally.
* Some clients edited the form unnecessarily, changing its format.
* Manually adding results was time-consuming and prone to errors.
* Creating charts from the results was also time-consuming.
* Tracking client results over time was difficult.
* Retrieving old submissions for repeatable forms to compare with new submissions was time-consuming.

The purpose of this project is to simplify the therapist’s workflow and save many hours of unnecessary manual work - such as calculating scores, creating charts, and sending multiple emails back and forth to correct client mistakes. What started as a seemingly simple idea turned out to be far more complex and involved than initially anticipated. I began by drafting a blueprint of how the system should function, but this design evolved continuously as I gained a deeper understanding of how the process could be refined and automated.

This application was developed progressively throughout 2025 as a Progressive Web App (PWA). It proved to be a challenging project because there were many aspects to consider simultaneously. While I am not yet at a software architect level, I leveraged significant assistance from AI tools throughout development to improve efficiency, code quality, and system design.

This project includes a password-protected admin dashboard that manages the distribution of therapy forms and client records. From the dashboard, an administrator can send either a single form or multiple forms to a client via email, create new client entries (based on an email address), revoke active forms or tokens, delete database records, and deactivate or reactivate client accounts.

Emails are sent through the Resend API, and each contains a unique access token that allows the client to securely open their assigned form. Tokens remain valid for 14 days and are automatically deactivated after expiry or once the form is submitted, preventing clients from retaining indefinite access.

Form submissions are automatically scored by backend scripts, and both the scores and responses are stored in a PostgreSQL (Neon) database. These results can be retrieved through the dashboard, where the “Summary” view displays pre-generated charts for clients who have completed specific questionnaires.

This application is hosted on the cloud platform Render. Due to the sensitive nature of the data, a live demo is not publicly available. However, the features section includes multiple screenshots, and I have posted a series of video examples using dummy data, both of which clearly demonstrate how the application works.

[Video 1](https://youtu.be/3WnS_OHUOWU) shows the general functions of the main dashboard. This includes:

* Searching up users who have submitted a form.
* Searching up users who have expired forms.
* Sending a new form to a user.
* Revoking a form from a user.

[Video 2](https://youtu.be/W1-StyVjz9g) shows an interchangeable UI for the form results summary page when a user has submitted multiple SMI forms.

[Video 3](https://youtu.be/Iigw7zTFNBE) shows an example of the form results summary page when a user has submitted all forms.

[Video 4](https://youtu.be/eYBd66YKvYs) shows the process of creating a new user and sending the form bundle to their email. It also shows the email being received (wired up with Resend API) and the forms being opened. After quickly demonstrating all forms, it then shows an example of a form being filled and submitted.

[Video 5](https://youtu.be/Qo2ALHhEPzE) shows a user being deactivated, activated and then permanently deleted.

![Integrate Therapy Form Manager on various devices](documentation/amiresponsive.png)

# UX

The Integrate Therapy Form Manager was designed to streamline the therapist’s workflow while providing a clear, intuitive experience for clients completing forms. The UX focuses on two main personas: therapists or administrators managing forms, and clients filling them out. For therapists, efficiency is key - the admin dashboard consolidates sending forms, revoking access, reviewing submissions, and visualising results into a single interface. Tasks like creating new clients, sending multiple forms, and generating summary charts now take just a few clicks, saving significant time.

Accessibility and clarity are at the heart of the experience. Forms are easy to read and navigate on any device, with intuitive layouts that guide users naturally from start to finish. Therapists can quickly interpret client data through clear, pre-generated charts and summaries, while clients encounter a calm, approachable interface that makes completing sensitive forms straightforward and stress-free.

Overall, the design balances security, efficiency, and empathy, creating an interface that simplifies therapist workflows, engages clients, and ensures accurate, trustworthy handling of sensitive information.

## Colour palette

![Integrate Therapy Form Manager colour palette](documentation/colourpalette.png)

This colour palette works well for the website because the combination of bright and deep blues conveys trust, calmness, and professionalism, while the light grey and white backgrounds keep the design clean and approachable, and the subtle accent shades provide clarity and visual hierarchy without overwhelming the user.

## Typography

Open Sans is used for body text, while Lora is used for headings. This combination was a deliberate choice to create a calm, professional, and approachable aesthetic. Open Sans provides clean, highly readable text for comfortable reading, and Lora adds elegance and visual distinction to headings, helping guide the user’s attention while reinforcing a sense of trust and credibility throughout the site.

# User stories

To guide the development of Integrate Therapy Form Manager, user stories were created to outline the essential tasks needed to build the website to a high standard. These user stories were further categorised into epics to facilitate an agile development approach.

View a full list of user stories [here](https://github.com/SasanTazayoni/integrate-therapy-form-manager/issues?q=is%3Aissue%20label%3A%22User%20Story%22).

EPIC 1: Authentication

- Authentication for Application Access - As an admin I can log in to the application so that only I can access its features and data. `(MUST HAVE)`

EPIC 2: User Management

- User Search and Form Status Tracking - As an admin I can search for a user in the database so that I can see the user’s status and track their submitted, pending, and expired forms. `(MUST HAVE)`
- Client Deactivation and Automatic Deletion (GDPR Compliant) - As an admin I can deactivate a client so that their data becomes inaccessible and is automatically deleted after 1 year of inactivity so that the system remains GDPR compliant and does not retain personal data unnecessarily. `(COULD HAVE)`
- Client Activation - As an admin I can reactivate a previously deactivated client so that they can resume receiving forms and their data becomes accessible again. `(COULD HAVE)`
- Client Deletion - As an admin I can permanently delete a client and all their associated data so that their personal information and forms are fully removed from the system in compliance with GDPR. `(MUST HAVE)`
- Add New Client from Search - As an admin I can add a new client when a searched user does not exist so that I can quickly create client records without leaving the search workflow. `(MUST HAVE)`

EPIC 3: Form Sending & Management

- Send All Unsent Forms via Email - As an admin I can send all unsent forms to a user at once so that the user receives all pending forms efficiently without sending them individually. `(SHOULD HAVE)`
- Send Individual Form via Email - As an admin I can send a single form to a user so that the user receives the specific form they need. `(MUST HAVE)`
- Revoke Individual Form - As an admin I can revoke an individual form so that users cannot have indefinite access to unfilled forms and are required to respond within a set period. `(SHOULD HAVE)`
- Receive Email for Individual Form - As a user I can receive an email with a link to a specific form so that I can complete the required form without waiting for other forms. `(MUST HAVE)`
- Receive Email for Multiple Forms (Bulk Send) - As a user I can receive a single email containing links to multiple forms so that I can complete all pending forms efficiently in one place. `(COULD HAVE)`

EPIC 4: Form Status & Results Tracking

- Display Form Status for Each Client - As an admin I can see the status of each form for a client so that I can quickly understand which forms have been sent, submitted, revoked, expired, or pending without checking individual records. `(SHOULD HAVE)`
- View Form Results Summary - As an admin I can view a summary of all filled-out forms for a client so that I can quickly review the client’s submitted data in one place. `(MUST HAVE)`
- Print Form Results Summary - As an admin I can print the form results summary page and SMI modal so that I can generate a physical copy of the client’s submitted data for review or record keeping. `(COULD HAVE)`
- Capture Client Name and Date of Birth on First Access - As a user I can enter my name and date of birth the first time I access a form so that my identity can be recorded and associated with my form submissions. `(MUST HAVE)`

EPIC 5: Specific Assessment Forms

- YSQ Form with Ratings and Validation - As a user I can complete the YSQ form with guidance, navigation, and validation so that I can accurately submit my responses and have them scored. `(MUST HAVE)`
- SMI Form with Ratings and Validation - As a user I can complete the SMI form with guidance, navigation, and validation so that I can accurately submit my responses and have them scored by subcategory. `(MUST HAVE)`
- Burns Anxiety Inventory (BAI) with Validation - As a user I can complete the BAI form by selecting answers that are scored 0–3 so that I can quickly assess my level of anxiety and submit my responses. `(MUST HAVE)`
- Beck Depression Inventory (BDI) with Validation - As a user I can complete the BDI form by selecting answers that are scored 0–3 so that I can quickly assess my level of depression and submit my responses. `(MUST HAVE)`

EPIC 6: Results Summary Table

- SMI Modes Table with Severity Highlighting - As an admin I can see the severity of each SMI schema mode in a table so that I can quickly identify high, very high, and severe scores. `(MUST HAVE)`
- SMI Score Scale Modal - As an admin I can open a modal to see the SMI score scale so that I can understand the meaning of the SMI scores. `(COULD HAVE)`
- Retrieve Older SMIs - As an admin I can retrieve previously submitted SMI forms so that I can view older results and update the UI for printing or comparison. `(COULD HAVE)`
- YSQ Table with Toggleable Scores - As an admin I can view the YSQ table with score ratings and totals so that I can analyze client data with the option to toggle raw scores or 4-5-6 scores. `(MUST HAVE)`
- BAI and BDI Small Cards with Scores - As an admin I can view the Burn’s Anxiety Inventory (BAI) and Beck’s Depression Inventory (BDI) in small cards so that I can quickly see anxiety and depression scores for the client. `(MUST HAVE)`

EPIC 7: UI / UX Enhancements

- Button Hover Ripple Animation Effect - As a user I can see a unique ripple animation when hovering over buttons so that the interface feels interactive and visually engaging. `(COULD HAVE)`
- Autosave In-Progress Forms - As a user I can have my form responses automatically saved while I am filling out a form so that I don’t lose my progress if I leave the page, navigate away, or experience a technical issue. `(WON'T HAVE)`

EPIC 8: Analytics

- Therapist Analytics Dashboard - As an admin I can view an analytics dashboard that shows aggregated data about all my clients’ form activity and results so that I can monitor overall progress, identify trends, and make informed clinical decisions. `(WON'T HAVE)`

# Wireframes

<details>
<summary> Click here to see the Dashboard wireframes </summary>

  - ![Dashboard page desktop](documentation/dashboard.jpg)
  - ![Dashboard page mobile](documentation/dashboardmobile.jpg)

</details>
<details>
<summary> Click here to see the Form Results Summary wireframes </summary>

  - ![Form Results Summary page desktop](documentation/formresults.jpg)
  - ![Form Results Summary page mobile](documentation/formresultsmobile.jpg)

</details>
<details>
<summary> Click here to see the Form wireframes (These forms look very similar on desktop and mobile therefore multiple wireframes were not needed for these) </summary>

  - ![SMI/YSQ forms followed by BDI/BAI forms](documentation/forms.jpg)

</details>

# Features

## Existing Features

### Dashboard

The Dashboard page consists of:

* An authentication modal to gain access to the application (for security):

![Admin login modal](documentation/adminlogin.png) <br>

* A title with a logo either side: <br>

![Title for Dashboard page](documentation/titlewithlogo.png) <br>

* A search bar for searching up clients via their email: <br>

![Search bar](documentation/searchbar.png) <br>
![Search bar empty](documentation/searchbarred.png) <br>
![Search bar with successful search](documentation/searchbargreen.png) <br>
![Search bar loading](documentation/searchbarloadingspinner.png) <br>

* A deactivate button which deactivates the client, disables form access and deletes the client after 1 year.
* An activate button which appears when the client is deactivated in order to reactivate them.
* A delete button to permanently delete the client. <br>

![Deactivate an Delete buttons](documentation/deactivatedelete.png) <br>
![Deactivate confirmation modal](documentation/deactivatemodal.png) <br>
![Activate confirmation modal](documentation/activatemodal.png) <br>
![Delete confirmation modal](documentation/deletemodal.png) <br>

* A prompt for adding new users to the database: <br>

![New user](documentation/newuser.png) <br>

* A hover animation on all buttons: <br>

![Hover animation](documentation/hoveranimation.png) <br>

* A control panel for sending and revoking forms as well as to see the status of forms for each particular person. <br>

![Control panel](documentation/controlpanel.png) <br>
![Active form](documentation/activeform.png) <br>
![Expired form](documentation/expiredform.png) <br>
![Resendable SMI form](documentation/resendablesmi.png) <br>
![Sending form](documentation/sendingform.png) <br>

* A summary button to access the Form Results Summary page: <br>

![Summary button](documentation/summarybutton.png) <br>

### Form Results Summary

The Form Results Summary page consists of:

* A header which has has a button that links back to the dashboard, the credentials of the user if the have been recorded, the title of the page and an icon to print the page from: <br>

![Summary page header](documentation/summarypageheader.png) <br>

* A SMI modes table with the date of submission (if one has been submitted): <br>

![SMI modes table](documentation/smimodestable.png) <br>

* An SMI summary sheet which is accessible via the SMI modes table by clicking on the paper icon: <br>

![SMI summary sheet](documentation/smiscoresummarysheet.png) <br>
![SMI summary sheet lower half](documentation/smiscoresummarysheet2.png) <br>

* An SMI submissions modal for previous submissions which is accessible via the SMI modes table by clicking on the database icon: <br>

![SMI submissions modal](documentation/smisubmissionsmodal.png) <br>

* A YSQ schemas table which can toggle scores: <br>

![YSQ schemas table](documentation/ysqschemastable.png) <br>
![YSQ schemas table inactive](documentation/ysqschemastableinactive.png) <br>

* Small card showing the BDI and BAI scores if they are recorded: <br>

![BDI and BAI cards](documentation/bdibaicards.png) <br>

### Questionnaires

There are 4 distinct questionnaires - YSQ, SMI, BDI, BAI.

The YSQ questionnaire consists of:

* A set of instructions explaining how the form should be filled: <br>

![YSQ instructions](documentation/ysqinstructions.png) <br>

* A dropdown togglable menu with quick instructions for the form: <br>

![YSQ dropdown instructions](documentation/ysqdropdown.png) <br>

* A large questionnaire: <br>

![YSQ questionnaire](documentation/ysqquestionnaire.png) <br>

The SMI questionnaire consists of (similar to YSQ):

* A set of instructions explaining how the form should be filled: <br>

![SMI instructions](documentation/smiinstructions.png) <br>

* A dropdown togglable menu with quick instructions for the form: <br>

![SMI dropdown instructions](documentation/smiquestionnaire.png) <br>

* A large questionnaire: <br>

![SMI questionnaire](documentation/smiquestionnaire.png) <br>

The BDI questionnaire consists of:

* A small questionnaire which is somewhat different to the SMI and YSQ with togglable answers: <br>

![BDI questionnaire](documentation/bdiquestionnaire.png) <br>

The BAI questionnaire consists of (similar to BDI):

![BAI questionnaire](documentation/baiquestionnaire.png) <br>

All questionnaires consist of:

* A reset button which opens a modal to confirm and a submission message when a form is submitted: <br>

![Form reset confirmation modal](documentation/resetmodal.png) <br>
![Form submission message](documentation/submissionmessage.png) <br>

When a user is sent an email with forms, it should look like this: <br>

![New email with forms](documentation/email.png) <br>

When a form is submitted, the token becomes inactive therefore the form becomes inaccessible: <br>

![Inactive form](documentation/invalidform.png) <br>

All new users will be asked to provide a name and a date of birth:

![New user information gathering](documentation/newuser.png) <br>

## Future features

* Autosave in-progress forms is useful because it prevents users from losing their work if they accidentally close the page, lose internet connection, or experience a system error. By automatically saving entered information as the user types, it saves time, reduces frustration, and ensures data accuracy. This feature improves user experience and productivity, especially for long or complex forms that would otherwise need to be filled out again from scratch.
* Therapist Analytics Dashboard is useful because it allows therapists to track key metrics about their clients, sessions, and outcomes in one place. It helps visualize trends such as client progress, session frequency, and treatment effectiveness, making it easier to identify patterns and adjust therapeutic approaches. By providing clear data insights, the dashboard supports evidence-based practice, improves client care, and enhances the therapist’s ability to manage workload and measure success over time.

* Tech used
* DB design
* Agile development process - github projects, github issues, moscow
* Testing - Deployment
* Credits
