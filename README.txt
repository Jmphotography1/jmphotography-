
JMPhotography static site package
================================

What this package contains:
- index.html, about.html, gallery.html, contact.html (public)
- admin/index.html (client-side password protected admin panel)
- assets/css/styles.css
- assets/js/admin.js
- assets/images/logo.png (placeholder logo)

How it works:
- The admin panel is client-side only. It lets you upload images, apply your logo as a watermark, preview the results, and export a ZIP that contains a folder for the event (galleries/<event-id>/) with watermarked images and a small manifest json.
- After downloading the zip, open it and move the folder into your repository under the 'galleries' folder. Then update galleries.json at the repo root by adding the event object (or use the manifest file that was created in the zip).
- The gallery page reads galleries.json to display events.

Steps to publish on GitHub Pages:
1. Push all files from this package to your repo root (jmphotography).
2. In your repo Settings > Pages, choose the branch (usually main) and root folder to publish.
3. Your site will be live at: https://<your-username>.github.io/jmphotography/

Admin password:
- Change the password by editing assets/js/admin.js and set ADMIN_PASSWORD to a secure string before pushing to GitHub.
- NOTE: client-side password protection is not fully secure. For more security, migrate to Firebase Auth or a real backend.

Gallery workflow (recommended):
1. Use Admin panel to watermark images and export ZIP.
2. Unzip and move the folder into /galleries/<event-id>/ in your repo.
3. Open galleries.json and add the event object (or copy manifest.json from the exported zip).
4. Commit & push to GitHub. The gallery page will show the new event.

Customizing:
- Replace assets/images/logo.png with your real transparent logo (400x400 recommended).
- Update colors in assets/css/styles.css (variables at top).
- You can edit HTML pages to add content.
