# Andy Li — Personal Space & Markdown Blog (`YichuLi.github.io`)

A warm, minimalist personal site and Markdown-powered blog/journal built with zero build dependencies. Directly deployable to **GitHub Pages** via `git push`.

---

## ✨ How to Write a New Blog / Journal Post

### Step 1: Create a `.md` file in `posts/`
Create a new Markdown file inside the [`posts/`](./posts) folder, for example `posts/2026-11-08-weekend-notes.md`:

```markdown
# Weekend Notes: Gym, Books & Coffee

Had a great weekend catching up on reading and hitting the gym...

## Highlights

- Finished a great book
- Watched a classic movie
```

### Step 2: Register the post in `posts/index.json`
Open [`posts/index.json`](./posts/index.json) and add a new entry at the top of the array:

```json
  {
    "slug": "2026-11-08-weekend-notes",
    "title": "Weekend Notes: Gym, Books & Coffee",
    "date": "2026-11-08",
    "category": "journal",
    "categoryLabel": "Journal",
    "readTime": "2 min read",
    "summary": "Had a great weekend catching up on reading and hitting the gym...",
    "file": "posts/2026-11-08-weekend-notes.md",
    "pinned": false
  }
```

Supported categories (`category` field):
- `"journal"` → **Journal** (Green tag)
- `"thoughts"` → **Thoughts** (Purple tag)
- `"tech"` → **Tech** (Blue tag)

### Step 3: Push to GitHub
Commit and push to your repository (`git add . && git commit -m "new post" && git push`). GitHub Pages will automatically update your site!

---

## 💻 Local Preview

You can open `index.html` directly, or start a lightweight local HTTP server in this folder so browser `fetch()` loads new `.md` files in real time:

```bash
python -m http.server 8000
# Then visit http://localhost:8000
```
