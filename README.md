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

* Wireframes
* Features - existing and future
* Tech used
* DB design
* Agile development process - github projects, github issues, moscow
* Testing - Deployment
* Credits
