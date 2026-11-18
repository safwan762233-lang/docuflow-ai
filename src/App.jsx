import { useEffect, useMemo, useRef, useState } from "react";
import {
  Aperture, AudioLines, Captions, ChevronDown, Clapperboard, Clock3,
  Download, Film, FolderOpen, Gauge, Layers3, Library, Mic2, MoreHorizontal,
  Music2, Pause, Play, Plus, Search, Settings2, Sparkles, Type, Upload,
  Video, Volume2, WandSparkles, X
} from "lucide-react";

const starterTracks = [
  { id: "video", name: "Video 1", type: "video", color: "blue", clips: [] },
  { id: "audio", name: "Audio 1", type: "audio", color: "purple", clips: [] },
  { id: "text", name: "Text & captions", type: "text", color: "gold", clips: [] }
];

const fmt = (n) => {
  const s = Math.max(0, Math.floor(n || 0));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

export default function App() {
  const [projectName, setProjectName] = useState("Untitled documentary");
  const [assets, setAssets] = useState([]);
  const [tracks, setTracks] = useState(starterTracks);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [activeTab, setActiveTab] = useState("media");
  const [search, setSearch] = useState("");
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(120);
  const [notice, setNotice] = useState("Your project is saved on this device");
  const [showTextDialog, setShowTextDialog] = useState(false);
  const [caption, setCaption] = useState("Your documentary title");
  const videoRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("docuflow-project-v1");
    if (!saved) return;
    try {
      const data = JSON.parse(saved);
      if (data.projectName) setProjectName(data.projectName);
      if (Array.isArray(data.tracks)) setTracks(data.tracks);
    } catch { /* Ignore an invalid local draft and start clean. */ }
  }, []);

  useEffect(() => {
    const snapshot = { projectName, tracks };
    localStorage.setItem("docuflow-project-v1", JSON.stringify(snapshot));
  }, [projectName, tracks]);

  useEffect(() => {
    if (!playing || !videoRef.current) return;
    const video = videoRef.current;
    const onTime = () => setCurrentTime(video.currentTime);
    const onEnd = () => setPlaying(false);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("ended", onEnd);
    return () => {
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("ended", onEnd);
    };
  }, [playing, selectedAsset]);

  const filteredAssets = useMemo(
    () => assets.filter((a) => a.name.toLowerCase().includes(search.toLowerCase())),
    [assets, search]
  );

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList || []);
    const next = incoming.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      kind: file.type.startsWith("video/") ? "video" : file.type.startsWith("audio/") ? "audio" : "image",
      url: URL.createObjectURL(file),
      size: file.size,
      file
    }));
    setAssets((old) => [...old, ...next]);
    if (!selectedAsset && next.length) setSelectedAsset(next[0]);
    setNotice(`${next.length} file(s) added to media library`);
  };

  const addToTimeline = (asset) => {
    const lane = asset.kind === "audio" ? "audio" : "video";
    const clip = { id: crypto.randomUUID(), assetId: asset.id, name: asset.name, start: 0, length: 12, kind: asset.kind };
    setTracks((old) => old.map((t) => t.id === lane ? { ...t, clips: [...t.clips, clip] } : t));
    setSelectedAsset(asset);
    setNotice("Clip added to timeline");
  };

  const addText = () => {
    const clip = { id: crypto.randomUUID(), name: caption.trim() || "Text layer", start: currentTime, length: 5, kind: "text" };
    setTracks((old) => old.map((t) => t.id === "text" ? { ...t, clips: [...t.clips, clip] } : t));
    setShowTextDialog(false);
    setNotice("Text layer added");
  };

  const removeClip = (trackId, clipId) => {
    setTracks((old) => old.map((t) => t.id === trackId ? { ...t, clips: t.clips.filter((c) => c.id !== clipId) } : t));
  };

  const togglePlayback = async () => {
    if (selectedAsset?.kind === "video" && videoRef.current) {
      if (videoRef.current.paused) {
        try { await videoRef.current.play(); setPlaying(true); }
        catch { setNotice("This video could not be played in the browser"); }
      } else {
        videoRef.current.pause();
        setPlaying(false);
      }
    } else {
      setPlaying((v) => !v);
      setNotice("Select a video clip to preview playback");
    }
  };

  const exportProject = () => {
    const data = { app: "DocuFlow AI", version: "0.1.0", projectName, tracks, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "docuflow-project.json";
    a.click();
    URL.revokeObjectURL(url);
    setNotice("Project file downloaded (timeline data only)");
  };

  const newProject = () => {
    if (!window.confirm("Start a new project? Your current timeline will be cleared.")) return;
    setProjectName("Untitled documentary");
    setTracks(starterTracks.map((t) => ({ ...t, clips: [] })));
    setCurrentTime(0);
    setNotice("New project created");
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand"><div className="brand-mark"><Aperture size={21}/></div><div><b>DocuFlow <span>AI</span></b><small>DOCUMENTARY STUDIO</small></div></div>
        <div className="project-title"><Clapperboard size={15}/><input aria-label="Project name" value={projectName} onChange={(e) => setProjectName(e.target.value)} /><span className="saved-dot"/> <small>Saved</small></div>
        <div className="top-actions"><button className="icon-btn" title="Settings"><Settings2 size={17}/></button><button className="share-btn" onClick={exportProject}><Download size={15}/> Export project</button><button className="avatar">S</button></div>
      </header>

      <div className="workspace">
        <aside className="left-panel panel">
          <div className="panel-heading"><div><span className="eyebrow">WORKSPACE</span><h2>Project assets</h2></div><button className="icon-btn" onClick={() => fileRef.current?.click()} title="Import media"><Plus size={17}/></button></div>
          <div className="tabs">
            <button className={activeTab === "media" ? "active" : ""} onClick={() => setActiveTab("media")}><Library size={15}/> Media</button>
            <button className={activeTab === "script" ? "active" : ""} onClick={() => setActiveTab("script")}><Type size={15}/> Script</button>
            <button className={activeTab === "sources" ? "active" : ""} onClick={() => setActiveTab("sources")}><FolderOpen size={15}/> Sources</button>
          </div>
          {activeTab === "media" ? <>
            <div className="searchbox"><Search size={15}/><input placeholder="Search your media..." value={search} onChange={(e) => setSearch(e.target.value)}/></div>
            <button className="import-card" onClick={() => fileRef.current?.click()}><div className="upload-icon"><Upload size={19}/></div><b>Import media</b><span>Video, audio and images</span><small>Browse files from your device</small></button>
            <input ref={fileRef} type="file" accept="video/*,audio/*,image/*" multiple hidden onChange={(e) => addFiles(e.target.files)}/>
            <div className="asset-label"><span>YOUR LIBRARY</span><span>{assets.length} ITEMS</span></div>
            <div className="asset-list">{filteredAssets.map((asset) => <button key={asset.id} className={selectedAsset?.id === asset.id ? "asset selected" : "asset"} onClick={() => { setSelectedAsset(asset); setCurrentTime(0); }}><div className={`asset-thumb ${asset.kind}`}>{asset.kind === "video" ? <Video size={17}/> : asset.kind === "audio" ? <AudioLines size={17}/> : <Film size={17}/>}</div><span className="asset-info"><b>{asset.name}</b><small>{asset.kind.toUpperCase()} · {(asset.size / 1048576).toFixed(1)} MB</small></span><button className="mini-add" title="Add to timeline" onClick={(e) => { e.stopPropagation(); addToTimeline(asset); }}><Plus size={15}/></button></button>)}
              {!assets.length && <div className="empty-assets"><Film size={23}/><b>Your media will appear here</b><span>Import footage to start editing</span></div>}
            </div>
          </> : <div className="empty-state"><Sparkles size={22}/><b>{activeTab === "script" ? "Script workspace" : "Source library"}</b><p>{activeTab === "script" ? "Your documentary script analysis tools will live here." : "Keep research links and verified references together."}</p><small>Coming in the next build</small></div>}
          <div className="storage-note"><div className="storage-icon"><FolderOpen size={16}/></div><div><b>Local workspace</b><small>Your imported media stays in this browser session.</small></div></div>
        </aside>

        <main className="center-panel">
          <section className="preview-section">
            <div className="section-bar"><div><span className="eyebrow">CANVAS / PREVIEW</span><h2>Program monitor</h2></div><div className="preview-tools"><span className="resolution">16:9</span><button className="icon-btn"><MoreHorizontal size={18}/></button></div></div>
            <div className="monitor">
              {selectedAsset?.kind === "video" ? <video ref={videoRef} key={selectedAsset.id} src={selectedAsset.url} onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 120)} onClick={togglePlayback} /> :
                selectedAsset?.kind === "image" ? <img src={selectedAsset.url} alt={selectedAsset.name}/> :
                <div className="monitor-placeholder"><div className="placeholder-symbol"><Aperture size={35}/></div><span className="eyebrow">YOUR STORY STARTS HERE</span><h3>{selectedAsset?.name || "A blank canvas for your next story"}</h3><p>Import footage, then add it to your timeline.</p><button className="outline-btn" onClick={() => fileRef.current?.click()}><Upload size={15}/> Import footage</button></div>}
              {selectedAsset?.kind === "audio" && <div className="audio-preview"><AudioLines size={38}/><b>{selectedAsset.name}</b><span>Audio selected · Add it to the timeline</span></div>}
            </div>
            <div className="transport"><div className="timecode"><b>{fmt(currentTime)}</b><span> / {fmt(duration)}</span></div><div className="transport-controls"><button className="icon-btn" onClick={() => { setCurrentTime(0); if(videoRef.current) videoRef.current.currentTime=0; }} title="Go to start">|◀</button><button className="play-btn" onClick={togglePlayback}>{playing ? <Pause size={17} fill="currentColor"/> : <Play size={17} fill="currentColor"/>}</button><button className="icon-btn" onClick={() => { const t=Math.min(duration,currentTime+5);setCurrentTime(t);if(videoRef.current)videoRef.current.currentTime=t; }} title="Forward 5 seconds">▶|</button></div><div className="monitor-meta"><Volume2 size={15}/><span>Preview audio</span><span className="divider-v"/><Gauge size={15}/><span>Fit</span></div></div>
          </section>

          <section className="timeline-section">
            <div className="timeline-header"><div><span className="eyebrow">EDITING</span><h2>Timeline</h2></div><div className="timeline-actions"><button className="tool-btn" onClick={() => setShowTextDialog(true)}><Type size={15}/> Add text</button><button className="tool-btn" onClick={() => fileRef.current?.click()}><Plus size={15}/> Add media</button><button className="icon-btn"><MoreHorizontal size={17}/></button></div></div>
            <div className="timeline-ruler"><span>00:00</span><span>00:15</span><span>00:30</span><span>00:45</span><span>01:00</span><span>01:15</span><span>01:30</span></div>
            <div className="timeline-body">
              <div className="track-labels">{tracks.map((track) => <div className="track-label" key={track.id}><span className={`track-icon ${track.color}`}>{track.type === "video" ? <Video size={14}/> : track.type === "audio" ? <Music2 size={14}/> : <Captions size={14}/>}</span><span>{track.name}</span><button className="dots"><MoreHorizontal size={14}/></button></div>)}</div>
              <div className="track-lanes">{tracks.map((track) => <div className="track-lane" key={track.id}>{track.clips.map((clip) => <div className={`clip ${track.color}`} key={clip.id} style={{ left: `${clip.start / 90 * 100}%`, width: `${clip.length / 90 * 100}%` }} title={clip.name}><span>{clip.name}</span><button onClick={() => removeClip(track.id, clip.id)} title="Remove clip"><X size={12}/></button></div>)}{!track.clips.length && <span className="lane-hint">{track.type === "video" ? "Drop video clips here" : track.type === "audio" ? "Drop music or voiceover here" : "Add titles and captions here"}</span>}</div>)}
                <div className="playhead" style={{ left: `calc(${currentTime / 90 * 100}% + 0px)` }}><div className="playhead-cap"/></div>
              </div>
            </div>
            <div className="timeline-footer"><span><Layers3 size={14}/> {tracks.reduce((n,t)=>n+t.clips.length,0)} clips on timeline</span><span><Clock3 size={14}/> {fmt(duration)} sequence</span><span className="autosave"><span className="saved-dot"/> Autosaved locally</span></div>
          </section>
        </main>

        <aside className="right-panel panel">
          <div className="panel-heading"><div><span className="eyebrow">CREATIVE TOOLS</span><h2>Studio tools</h2></div><WandSparkles size={19} className="muted-icon"/></div>
          <div className="tool-group"><span className="group-label">DOCUMENTARY WORKFLOW</span>
            <button className="feature-tool" onClick={() => setActiveTab("script")}><div className="feature-icon violet"><Sparkles size={17}/></div><span><b>Script breakdown</b><small>Turn narration into scenes</small></span><span className="soon">SOON</span></button>
            <button className="feature-tool" onClick={() => setActiveTab("sources")}><div className="feature-icon teal"><Search size={17}/></div><span><b>Research & sources</b><small>Organize verified references</small></span><span className="soon">SOON</span></button>
            <button className="feature-tool" onClick={() => setShowTextDialog(true)}><div className="feature-icon gold"><Captions size={17}/></div><span><b>Titles & captions</b><small>Add a text layer</small></span><Plus size={15} className="muted-icon"/></button>
          </div>
          <div className="tool-group"><span className="group-label">POST-PRODUCTION</span>
            <button className="feature-tool" onClick={() => setNotice("Color controls are planned for a future build")}><div className="feature-icon orange"><Aperture size={17}/></div><span><b>Color & look</b><small>Shape your visual mood</small></span><span className="soon">SOON</span></button>
            <button className="feature-tool" onClick={() => setNotice("Audio mixing tools are planned for a future build")}><div className="feature-icon blue"><Mic2 size={17}/></div><span><b>Sound design</b><small>Music, ambience, voiceover</small></span><span className="soon">SOON</span></button>
            <button className="feature-tool" onClick={exportProject}><div className="feature-icon green"><Download size={17}/></div><span><b>Project backup</b><small>Download your timeline data</small></span><Download size={14} className="muted-icon"/></button>
          </div>
          <div className="ai-card"><div className="ai-card-top"><Sparkles size={16}/><span>DOCUFLOW AI</span><span className="local-tag">LOCAL-FIRST</span></div><b>Your creative co-pilot.</b><p>Core editing tools work in your browser. AI-assisted writing and analysis can be connected to a local model in a later milestone.</p><div className="ai-status"><span className="status-dot"/> Editing workspace ready</div></div>
        </aside>
      </div>
      <footer className="statusbar"><div><span className="status-dot"/> {notice}</div><div>DOCUFLOW AI <span className="status-sep">·</span> BUILD 0.1.0 <span className="status-sep">·</span> LOCAL PROJECT</div></footer>

      {showTextDialog && <div className="modal-backdrop" onMouseDown={(e) => { if(e.target===e.currentTarget) setShowTextDialog(false); }}><div className="modal"><div className="modal-head"><div><span className="eyebrow">TIMELINE LAYER</span><h3>Add title or caption</h3></div><button className="icon-btn" onClick={() => setShowTextDialog(false)}><X size={18}/></button></div><label>Text content</label><input className="modal-input" value={caption} onChange={(e) => setCaption(e.target.value)} autoFocus/><div className="modal-actions"><button className="outline-btn" onClick={() => setShowTextDialog(false)}>Cancel</button><button className="share-btn" onClick={addText}><Plus size={15}/> Add to timeline</button></div></div></div>}
    </div>
  );
}