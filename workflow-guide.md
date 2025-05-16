
# 🛠️ Future Skill Project – Git Workflow Guide

## 📌 Purpose

This guide defines how our team collaborates using Git and GitHub to ensure smooth, consistent, and conflict-free development of the Graduation Form System.

---

## 🧪 Branch Strategy

### Main Branches:
- `main`: Final, stable version of the project (deployment-ready)
- `dev`: Ongoing development branch (where feature branches are merged)

### Feature Branches (for each developer):
- `vova_database`: Vova – Database logic & MySQL
- `daasha_email`: Daasha – Email functionality & submission logic
- `vraj_frontend`: Vraj – Frontend UI/UX
- `muskan_frontend`: Muskan – Frontend UI/UX

✅ All feature branches must be created from `dev`.

---

## 🚀 How to Start Working

```bash
git checkout dev
git pull origin dev
git checkout -b your_branch_name_here
```

> Replace `your_branch_name_here` with your assigned branch (e.g., `vova_database`).

---

## 💾 Making Changes

```bash
# Add new or changed files
git add .

# Commit your changes with a meaningful message
git commit -m "Added schema for students and forms"

# Push your branch to GitHub
git push --set-upstream origin your_branch_name_here
```

> After the first push, you can just use `git push`.

---

## 🔄 Keeping Your Branch Up-to-Date with `dev`

To avoid merge conflicts, always pull the latest `dev` changes into your branch:

```bash
git checkout your_branch_name_here
git pull origin dev
```

If conflicts appear, resolve them manually, then:

```bash
git add .
git commit -m "Resolved merge conflicts with dev"
```

---

## 🔀 Merging Your Work into `dev`

Once your feature is ready:

```bash
git checkout dev
git pull origin dev
git merge your_branch_name_here
git push origin dev
```

> Or open a Pull Request on GitHub if working collaboratively.

---

## 📁 Folder Structure

Each developer has a designated area:

```
Future-Skill-Project/
├── backend/             ← Backend server logic
├── database/            ← MySQL schema and config
├── email/               ← Email service logic (Daasha)
├── frontend/
│   ├── vraj/            ← Vraj’s frontend code
│   └── muskan/          ← Muskan’s frontend code
├── README.md
├── workflow-guide.md    ← This file
└── .gitignore
```

> Empty folders contain a `.gitkeep` file to ensure visibility in Git.

---

## 💡 Best Practices

- Commit frequently, with meaningful messages
- Pull regularly to avoid large conflicts
- Keep your code modular and isolated
- Never push directly to `main` or `dev` without testing
- Communicate with the team if you plan major structural changes

---

## 🧠 Common Git Commands

```bash
git status                       # Check modified files
git log --oneline --graph        # View branch history
git checkout branch_name         # Switch branches
git branch                       # List all branches
git merge branch_name            # Merge into current branch
git pull origin branch_name      # Pull latest updates
git push                         # Push to GitHub
```

---

## 🧠 Git Tips & Explanations

### What `git add` really does

It stages your changes for commit. Without `git add`, Git won’t include your file in the next commit.

```bash
git add file.txt        # Adds one file
git add folder_name/    # Adds a full folder
git add .               # Adds everything (new, modified, deleted)
```

### What `git commit` does

Saves your current changes locally into Git's history.

### What `git push` does

Sends all committed changes to GitHub (your remote repository).

### Push only one file

```bash
git add path/to/your/file.txt
git commit -m "Only pushing this file"
git push
```

### Git and folders

Git doesn't track empty folders. To make sure folders appear in GitHub, place a file called `.gitkeep` inside them.

---

## 🆘 Need Help?

Ask ChatGPT in this workspace or message Daasha (Team Leader).

Happy coding! 🚀
