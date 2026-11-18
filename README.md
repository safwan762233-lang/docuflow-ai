# DocuFlow AI — Professional Documentary Studio

DocuFlow AI is a local-first documentary editing workspace. This repository currently contains **Milestone 1: the editing workspace foundation**.

## Current features
- Dark, responsive editing interface
- Import local video, audio, and image files into a browser-session media library
- Preview selected video and images
- Add media clips to video/audio timeline lanes
- Add simple text/caption timeline layers
- Remove timeline clips
- Local autosave for project name and timeline structure
- Export project timeline metadata as JSON

## Important limitations in this milestone
- This is not yet a full nonlinear video editor.
- Export currently downloads **project JSON**, not a rendered MP4.
- Imported media uses temporary browser object URLs; the actual media files are not embedded in the saved project.
- Script analysis, research verification, AI generation, advanced effects, transitions, multi-track audio mixing, and final video rendering are planned milestones, not implemented features.
- AI features will require a locally installed model or an explicitly configured provider. No paid AI API is required for the current editing workspace.

## Run on Windows
1. Install Node.js 20 or newer.
2. Download or clone this repository.
3. Open the project folder in Terminal.
4. Run:

```bash
npm install
npm run dev
```

5. Open the local address printed by Vite (usually http://localhost:5173).

## Build
```bash
npm run build
npm run preview
```

## Roadmap
1. **Workspace foundation** — media bin, preview, timeline, local project state.
2. **Editing engine** — accurate clip timing, trimming, snapping, undo/redo, keyboard shortcuts.
3. **Documentary workflow** — script breakdown, storyboard, footage plan, source verification.
4. **Post-production** — captions, audio tools, color controls, transitions and effects.
5. **Rendering** — reliable MP4 export and project packaging.
6. **Local AI** — optional integration with a locally running language model.

## License
The repository currently contains the GNU AGPL v3 license. Review its terms before distributing hosted or modified versions.
