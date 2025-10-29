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

* Wireframes
* Features - existing and future
* Tech used
* DB design
* Agile development process - github projects, github issues, moscow
* Testing - Deployment
* Credits
