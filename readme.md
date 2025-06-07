# 🎓 EduLaunch — A Modern SaaS LMS Platform

EduLaunch is a powerful, scalable, and customizable **SaaS Learning Management System (LMS)** platform that allows organizations, mentors, and students to collaborate, learn, and grow — all in one place.

---

## 🚀 Features

### 🏫 For Organizations (Admin)
- Create/manage cohorts, mentors, and students
- Add learning modules and tasks (blogs, projects, quizzes)
- View student progress & analytics
- Issue completion certificates
- Assign mentors to cohorts

### 🎓 For Students
- Access learning tasks, submit blogs/projects
- Get personalized feedback from mentors
- Track progress & XP points
- Apply for jobs/internships
- Chat with peers & mentors

### 🧑‍🏫 For Mentors
- Manage assigned cohorts
- Review and grade submissions
- Give structured or AI-generated feedback
- Host chat sessions and discussions

### 👑 For SuperAdmin (SaaS Owner)
- Manage all organizations and admins
- Define pricing plans and billing via Razorpay/Stripe
- Access global analytics and audit logs
- Control platform-wide configuration

---

## 🔒 Role-based Access (RBAC)

| Role         | Permission Scope                        |
|--------------|------------------------------------------|
| `student`     | Task, submission, chat, feedback         |
| `mentor`      | Review tasks, feedback, cohort control   |
| `admin`       | Full org-level control (cohorts/users)   |
| `superadmin`  | Global SaaS control (all orgs/billing)   |

---

## 🧱 Tech Stack

- **Frontend**: Next.js 15 + TailwindCSS + ShadCN UI
- **Backend**: Node.js / Express / Nest.js (Optional)
- **Database**: MongoDB + Mongoose + TypeScript models
- **Auth**: JWT + Cookies + RBAC middleware
- **Payments**: Razorpay / Stripe
- **AI**: OpenAI for feedback/auto-grading
- **Hosting**: Vercel (frontend) + Render / Railway (API)

---


---

## 🗺 Roadmap

**Phase 1:** Auth, Role System, Org Onboarding  
**Phase 2:** Cohort System, Learning Modules, Feedback  
**Phase 3:** Chat, Jobs, Analytics  
**Phase 4:** Subscription & Billing  
**Phase 5:** AI-powered Feedback, Auto-grading, Polish
---

## 📄 License

MIT © Legend Army  
Contributions, feedback, and feature requests are welcome!

