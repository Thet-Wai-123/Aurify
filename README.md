# Aurify
Aurify is a modern web application designed to help users practice, learn, and engage with AI-powered feedback and community features. Built with React, Vite, TypeScript, shadcn-ui, and Tailwind CSS, Aurify offers a sleek, interactive experience for users interested in language learning, productivity, or other AI-driven tasks.
## Live Deployment
You can view the deployed app here: Aurify
## Tech Stack (Aurify)
When the app is finished, Aurify will use:
**Frontend**: React, Vite, TypeScript, shadcn-ui, Tailwind CSS
**State Management**: React Context, custom hooks
**Authentication**: Firebase Auth (or similar)
**AI Services**: Google Gemini API, custom feedback services
**Backend (optional)**: Firebase, or custom Node.js/Express server (if needed)
**Deployment**: Vercel (recommended), Netlify, or similar
**Testing**: Jest, React Testing Library (if added)
**CI/CD**: GitHub Actions (optional)
This stack is modern, scalable, and easy for contributors to work with.
## Intern Onboarding & Contribution Tutorial
To ensure code quality and prevent accidental changes to the main repository, all interns should work on their own forks. Here's how to get started:
### 1. Fork the Repository
Go to the main Aurify repo (e.g., https://github.com/Aurify-AI/Aurify) and click the "Fork" button at the top right. This will create a personal copy of the repo under your GitHub account.
### 2. Clone Your Fork
```bash
git clone https://github.com/<your-username>/Aurify.git
cd Aurify
```
### 3. Set Up the Project
Follow the setup instructions in the README to install dependencies and run the project locally.
### 4. Make Changes on a Branch
```bash
git checkout -b feature/my-feature
```
Commit your changes:
```bash
git add .
git commit -m "Describe your changes"
```
### 5. Push Changes to Your Fork
```bash
git push origin feature/my-feature
```
### 6. Open a Pull Request
Go to your fork on GitHub, and you'll see a "Compare & pull request" button. Click it to open a PR against the main Aurify repo.
### 7. Review & Merge
Your PR will be reviewed by a maintainer. Once approved, it will be merged into the main repo.
**Best Practices:**
- Always work on a branch, never on main.
- Keep your fork up to date by syncing with the upstream repo regularly.
- Ask questions and request reviews if you're unsure about anything.
## What does Aurify do?
Aurify provides:
- AI-powered feedback and suggestions (using Google Gemini and other services)
- Community features for sharing and tracking progress
- Practice sessions and history tracking
- Authentication and user profiles
- Responsive design for mobile and desktop
## How to run Aurify after you fork
**Clone your fork**
```bash
git clone <YOUR_FORK_URL>
cd aurify
```
**Install dependencies**
```bash
npm install
```
**Set up environment variables**
Create a `.env` file in the root directory and add your API keys and config. Example:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_GEMINI_API_KEY=your_gemini_api_key
```
Check `src/lib/firebase.ts` and `src/services/ai/geminiService.ts` for required variables.
**4. Start the development server**
```bash
npm run dev
```
The app will be available at http://localhost:5173.
## Technologies Used
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
## Deployment
Aurify can be deployed using Vercel, Netlify, or any static hosting provider.
## How can I edit this code?
**Use your preferred IDE**
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm i
npm run dev
```
**Edit a file directly in GitHub**

Navigate to the file.
Click the pencil icon.
Commit your change.

**Use GitHub Codespaces**

Go to your repo → Code → Codespaces → New Codespace.
Edit and commit directly.

## Backend & Services Documentation
### Project Structure
```
src/
├─ lib/firebase.ts         # Firebase init
├─ services/
│  ├─ authService.ts      # Authentication (sign in/up/out)
│  ├─ profileService.ts   # User profile CRUD
│  ├─ sessionService.ts   # Practice session CRUD
│  ├─ feedbackService.ts  # AI feedback storage
│  ├─ historyService.ts   # Fetch sessions + feedback
│  ├─ loggingService.ts   # Optional error/event logging
│  └─ ai/geminiService.ts # Google Gemini integration
└─ tests/services/        # Unit tests
```
### Service APIs (summary)
**authService** → signIn, signUp, signOut, onAuthChange
**profileService** → createProfile, updateProfile, getProfile
**sessionService** → createSession, getSession, listSessions, deleteSession
**feedbackService** → saveFeedback, listFeedback
**historyService** → getHistory
**loggingService** → logEvent
**geminiService** → generateFeedback
### Firestore Suggested Collections
`users/{uid}` – profile
`sessions/{uid}/items/{sessionId}` – practice sessions
`feedback/{uid}/items/{feedbackId}` – AI feedback linked to sessions
`logs/{uid}/items/{logId}` – optional logs
## Testing
**Framework**: Jest (with React Testing Library if needed)
Add tests in `src/tests/services/`
```javascript
import { describe, it, expect } from 'vitest';
describe('authService', () => {
it('placeholder test', () => {
expect(true).toBe(true);
});
});
```
Run tests:
```bash
npm test
```
## Security & API Keys
- Never commit `.env`.
- Don't hardcode keys in services.
Example Firestore rule for dev:
```javascript
rules_version = '2';
service cloud.firestore {
match /databases/{database}/documents {
match /users/{uid} {
allow read, write: if request.auth != null && request.auth.uid == uid;
}
}
}
```
## Troubleshooting
**Invalid API key** → check `.env` values.
**Permission denied* → Firestore rules may need adjusting.
**Blank page** → ensure `npm run dev` shows no build errors.
## Next Suggested PRs
- Add `.env.example`
- Add JSDoc comments for services
- Add test placeholders