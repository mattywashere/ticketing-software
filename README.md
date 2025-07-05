[View Website Demo](https://mattywashere.github.io/ticketing-software)

<h2> Project Overview </h2>
Done with the aid of AI, just to get a grasp on React & website development.

<h2>Features</h2>

- Ticket Creation: Users can easily create new tickets by providing a title, detailed description, and initial status (Open).

- Real-time Ticket Listing: All created tickets are displayed in a dynamic list, updated in real-time as new tickets are added or existing ones are modified.

- Ticket Management:

- Edit Functionality: Users can update the title, description, and status of existing tickets.

- Delete Functionality: Tickets can be removed from the system.

- Persistent Data Storage: All ticket data is securely stored and managed using Google Firebase Firestore, ensuring data integrity and availability.

- Anonymous Authentication: Utilizes Firebase Anonymous Authentication for seamless user access without requiring explicit sign-ups, demonstrating basic authentication integration.

- Responsive Design: The application is built with Tailwind CSS, ensuring a clean, modern, and fully responsive user interface that adapts to various screen sizes (desktop, tablet, mobile).

- User ID Display: Displays a unique user ID for tracking and potential future multi-user features.

<h2>Technologies Used</h2>

- Frontend: React.js (with Create React App boilerplate)

- Styling: Tailwind CSS (CDN)

- Backend/Database: Google Firebase (Firestore for database, Authentication for anonymous sign-in)

- Deployment: GitHub Pages

<h2>Accomplished</h2>

- Set up a React development environment from scratch, including project initialization.

- Integrated Firebase for real-time data storage (Firestore) and user authentication (Anonymous Auth).

- Designed and implemented the core UI components for ticket creation, display, editing, and deletion using React hooks and functional components.

- Managed application state effectively to handle form inputs, ticket lists, and modal visibility.

- Handled asynchronous operations for interacting with the Firebase API (adding, updating, deleting, and fetching data).

- Implemented a responsive design using Tailwind CSS to ensure a consistent user experience across devices.

- Configured the project for deployment to GitHub Pages, including setting up gh-pages and necessary package.json scripts.

- Troubleshot and resolved common development issues, such as module not found errors, API key validation, and styling not loading, demonstrating problem-solving skills.

<h2>Installation and Local Setup</h2>

To run this project locally:

1. Clone the repository:

```
 git clone https://github.com/mattywashere/ticketing-software.git
 cd ticketing-software
```
2. Install dependences

```
npm install
# OR yarn install
```
3. Configure Firebase:

- Go to your Firebase Console.

- Create a new project or select your existing ticketing-software-dcdde project.

- In Project settings (gear icon) -> General, add a new Web App (</>).

- Copy your firebaseConfig object.

- Paste this firebaseConfig object into src/App.js, replacing the placeholder values.

- In Authentication -> Sign-in method, enable "Anonymous" authentication.

4. Start the development server:

```
npm start
# OR yarn start
```
The application will open in your browser (usually at http://localhost:3000).

<h2>Usage</h2>

- Fill in the "Ticket Title" and "Description" fields.

- Select a "Status" from the dropdown.

- Click "Create Ticket" to add it to the list.

- Use the "Edit" and "Delete" buttons next to each ticket to manage them.

<h2>Live Demo</h2>
  
- You can view a live demo of the application deployed on GitHub Pages here:
- https://mattywashere.github.io/ticketing-software
