"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { Modal } from "./Modal";
import styles from "./ProjectNotebook.module.css";

// An original engineering-notebook treatment inspired by ThreeUI's Sketchbook.
// No ThreeUI implementation or illustration assets are copied here.
const pages = [
  {
    id: "design",
    label: "Design",
    eyebrow: "GEOMETRY & PRINCIPLE",
    title: "Linking geometry with efficiency.",
    description:
      "Investigated how geometric parameters affect the efficiency gap between idealized computational turbine models and physical devices.",
    work: [
      "Created the turbine layout in SolidWorks to study disk geometry and spacing.",
      "Modeled the turbine in 3D using ANSYS Fluent for computational fluid dynamics analysis.",
    ],
    note: "Instead of conventional blades, a Tesla turbine uses a stack of closely spaced disks.",
    image: "/images/tesla-turbine-cad.png",
    alt: "Tesla turbine model showing the bolted enclosure, protruding shaft, and mounting feet",
    figure: "FIG. 01 / PROTOTYPE MODEL",
    caption: "The exterior assembly: enclosure, shaft, and mounting structure.",
  },
  {
    id: "fabrication",
    label: "Fabrication",
    eyebrow: "MODEL TO HARDWARE",
    title: "Turning the design into hardware.",
    description:
      "Fabricated a laser-cut turbine prototype from the SolidWorks layout, connecting the geometric study with a physical device for testing.",
    work: [
      "Assembled the prototype into a rig for multi-pressure testing.",
      "Connected the turbine to a generator through a shaft coupling.",
    ],
    note: "The assembled system brings component interfaces, mounting, and shaft alignment into view.",
    image: "/images/tesla-turbine-setup.png",
    alt: "Assembled Tesla turbine test rig with a coupling, generator, flowmeter, pressure gauge, multimeter, and tachometer",
    figure: "FIG. 02 / ASSEMBLED TEST RIG",
    caption: "The prototype connected to its generator and measurement equipment.",
  },
  {
    id: "testing",
    label: "Testing",
    eyebrow: "OBSERVE & MEASURE",
    title: "Testing the gap between model and reality.",
    description:
      "Tested the prototype at multiple pressures and used 3D CFD modeling in ANSYS Fluent to investigate mechanical efficiency and real-world fluid losses.",
    work: [
      "Identified a narrow 1.0 mm disk gap as optimal for boundary-layer interaction and mechanical efficiency in the tested configurations.",
      "Validated real-world fluid losses to connect computational models with physical performance.",
    ],
    note: "The rig brings flow, pressure, shaft speed, and electrical readings into one test arrangement.",
    image: "/images/tesla-turbine-setup.png",
    alt: "Annotated Tesla turbine test setup identifying the flow control valve, flowmeter, pressure gauge, generator, multimeter, and tachometer",
    figure: "FIG. 03 / INSTRUMENTATION",
    caption: "Inspect the labelled instruments to follow the experimental setup.",
  },
] as const;

const callouts = [
  { label: "Enclosure", x: 45, y: 35, note: "The bolted enclosure houses the turbine assembly." },
  { label: "Output shaft", x: 64, y: 52, note: "The projecting shaft connects the turbine to the external load." },
  { label: "Mounting feet", x: 33, y: 80, note: "The mounting feet locate the prototype on its supporting surface." },
];

function Arrow({ direction = "right" }: { direction?: "left" | "right" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={direction === "left" ? { transform: "rotate(180deg)" } : undefined}>
      <path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InspectIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="m15.5 15.5 5 5M10.5 7.5v6m-3-3h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ProjectNotebook() {
  const [pageIndex, setPageIndex] = useState(0);
  const [selectedCallout, setSelectedCallout] = useState<number | null>(null);
  const [inspectionOpen, setInspectionOpen] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const page = pages[pageIndex];

  const selectPage = (index: number) => {
    setPageIndex(index);
    setSelectedCallout(null);
  };

  const handleTabKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % pages.length;
    else if (event.key === "ArrowLeft") next = (index + pages.length - 1) % pages.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = pages.length - 1;
    else return;
    event.preventDefault();
    selectPage(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className={styles.notebook}>
      <div className={styles.notebookToolbar}>
        <span className={styles.notebookLabel}>
          <span className={styles.notebookDot} aria-hidden="true" />
          THE PROJECT NOTEBOOK
        </span>
        <span className={styles.volumeLabel}>VOL. 01 / IUBAT</span>
      </div>

      <div role="tablist" aria-label="Project stages" className={styles.tabs}>
        {pages.map((item, index) => (
          <button
            key={item.id}
            ref={(node) => { tabRefs.current[index] = node; }}
            type="button"
            role="tab"
            id={`project-tab-${item.id}`}
            aria-controls={`project-panel-${item.id}`}
            aria-selected={pageIndex === index}
            tabIndex={pageIndex === index ? 0 : -1}
            className={styles.tab}
            onClick={() => selectPage(index)}
            onKeyDown={(event) => handleTabKey(event, index)}
          >
            <span className={styles.tabNumber}>0{index + 1}</span>
            {item.label}
            <span className={styles.tabArrow} aria-hidden="true">↗</span>
          </button>
        ))}
      </div>

      <div
        key={page.id}
        role="tabpanel"
        id={`project-panel-${page.id}`}
        data-highlight-scope={`project-panel-${page.id}`}
        aria-labelledby={`project-tab-${page.id}`}
        tabIndex={0}
        className={styles.spread}
      >
        <div className={styles.notesPage}>
          <div className={styles.pageHeading}>
            <span className="mono-label text-blueline">{page.eyebrow}</span>
            <span className={styles.largeNumber} aria-hidden="true">0{pageIndex + 1}</span>
          </div>
          <h4 className={styles.stageTitle}>{page.title}</h4>
          <p className={styles.stageDescription}>{page.description}</p>
          <div className={styles.contribution}>
            <p className="mono-label text-graphite">MY WORK</p>
            <ul>
              {page.work.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
          <aside className={styles.marginNote}>
            <span aria-hidden="true">↳</span>
            <p>{page.note}</p>
          </aside>
          <span className={styles.pageFolio}>T. RAHMAN / THESIS NOTES</span>
        </div>

        <div className={styles.visualPage}>
          <figure>
            <div className={styles.imageMount}>
              <span className={styles.photoTape} aria-hidden="true" />
              <div className={styles.projectImage}>
                <Image
                  src={page.image}
                  alt={page.alt}
                  fill
                  sizes="(max-width: 767px) 90vw, 600px"
                  className={styles.image}
                />
                {pageIndex === 0 && callouts.map((callout, index) => (
                  <button
                    key={callout.label}
                    type="button"
                    className={styles.calloutPin}
                    style={{ left: `${callout.x}%`, top: `${callout.y}%` }}
                    aria-label={`Show detail: ${callout.label}`}
                    aria-pressed={selectedCallout === index}
                    onClick={() => setSelectedCallout(selectedCallout === index ? null : index)}
                  >
                    <span>0{index + 1}</span>
                  </button>
                ))}
              </div>
            </div>
            <figcaption className={styles.figureCaption}>
              <span>{page.figure}</span>
              <span>PLATE 0{pageIndex + 1}</span>
            </figcaption>
          </figure>
          <div className={styles.imageNote} aria-live="polite" aria-atomic="true">
            {selectedCallout !== null ? (
              <p><strong>{callouts[selectedCallout].label}.</strong> {callouts[selectedCallout].note}</p>
            ) : (
              <p>{page.caption} {pageIndex === 0 && <span className={styles.pinHint}>Select a numbered detail.</span>}</p>
            )}
          </div>
          <button type="button" className={`draft-button ${styles.inspectButton}`} onClick={() => setInspectionOpen(true)}>
            <InspectIcon />
            Inspect image
            <Arrow />
          </button>
          <span className={styles.pageCurl} aria-hidden="true" />
        </div>
      </div>

      <div className={styles.pageNavigation}>
        <button type="button" onClick={() => selectPage(pageIndex - 1)} disabled={pageIndex === 0} aria-label="Previous notebook page">
          <Arrow direction="left" /><span>Previous</span>
        </button>
        <p aria-live="polite" aria-atomic="true"><span className={styles.currentPage}>0{pageIndex + 1}</span> / 03</p>
        <button type="button" onClick={() => selectPage(pageIndex + 1)} disabled={pageIndex === pages.length - 1} aria-label="Next notebook page">
          <span>Next page</span><Arrow />
        </button>
      </div>

      <Modal open={inspectionOpen} onClose={() => setInspectionOpen(false)} title={`${page.label} / Tesla turbine`} className={styles.inspectionModal}>
        {inspectionOpen && <ProjectImageInspector src={page.image} alt={page.alt} />}
      </Modal>
    </div>
  );
}

function ProjectImageInspector({ src, alt }: { src: string; alt: string }) {
  const [zoom, setZoom] = useState(1);
  const [lensEnabled, setLensEnabled] = useState(false);
  const [lens, setLens] = useState({ x: 0.5, y: 0.5 });
  const [size, setSize] = useState({ width: 0, height: 0 });
  const imageAreaRef = useRef<HTMLDivElement>(null);
  const hintId = useId();
  const lensSize = 150;

  useEffect(() => {
    const element = imageAreaRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const moveLens = (event: PointerEvent<HTMLDivElement>) => {
    if (!lensEnabled || (event.pointerType !== "mouse" && event.buttons === 0)) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setLens({
      x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)),
    });
  };

  const moveLensByKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!lensEnabled) return;
    const offsets: Record<string, [number, number]> = {
      ArrowLeft: [-0.025, 0], ArrowRight: [0.025, 0], ArrowUp: [0, -0.025], ArrowDown: [0, 0.025],
    };
    const offset = offsets[event.key];
    if (!offset) return;
    event.preventDefault();
    setLens((previous) => ({
      x: Math.max(0, Math.min(1, previous.x + offset[0])),
      y: Math.max(0, Math.min(1, previous.y + offset[1])),
    }));
  };

  return (
    <div className={styles.inspector}>
      <div className={styles.inspectorTools}>
        <div className={styles.zoomControls} aria-label="Image zoom controls">
          <button type="button" onClick={() => setZoom((value) => Math.max(1, value - 0.5))} disabled={zoom === 1} aria-label="Zoom out">−</button>
          <button type="button" onClick={() => setZoom(1)} aria-label="Reset image zoom" className={styles.zoomValue}>{Math.round(zoom * 100)}%</button>
          <button type="button" onClick={() => setZoom((value) => Math.min(3, value + 0.5))} disabled={zoom === 3} aria-label="Zoom in">+</button>
        </div>
        <button
          type="button"
          className={styles.lensButton}
          aria-pressed={lensEnabled}
          onClick={() => {
            setLensEnabled((enabled) => !enabled);
            if (!lensEnabled) requestAnimationFrame(() => imageAreaRef.current?.focus());
          }}
        >
          <InspectIcon />
          {lensEnabled ? "Lens on" : "Inspection lens"}
        </button>
      </div>
      <div className={styles.inspectorViewport} tabIndex={0} role="region" aria-label="Zoomable project image">
        <div
          ref={imageAreaRef}
          className={`${styles.inspectorImageArea} ${lensEnabled ? styles.lensActive : ""}`}
          style={{ width: `${zoom * 100}%` }}
          tabIndex={lensEnabled ? 0 : -1}
          role="region"
          aria-label="Image inspection area"
          aria-describedby={hintId}
          onPointerMove={moveLens}
          onPointerDown={(event) => {
            if (lensEnabled) {
              event.currentTarget.setPointerCapture(event.pointerId);
              moveLens(event);
            }
          }}
          onPointerUp={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
          }}
          onKeyDown={moveLensByKey}
        >
          <Image src={src} alt={alt} fill sizes="1448px" quality={90} className={styles.image} draggable={false} />
          {lensEnabled && size.width > 0 && (
            <span
              className={styles.lens}
              aria-hidden="true"
              style={{
                left: `${lens.x * 100}%`, top: `${lens.y * 100}%`,
                width: lensSize, height: lensSize,
                backgroundImage: `url("${src}")`,
                backgroundSize: `${size.width * 2}px ${size.height * 2}px`,
                backgroundPosition: `${lensSize / 2 - lens.x * size.width * 2}px ${lensSize / 2 - lens.y * size.height * 2}px`,
              }}
            >
              <span className={styles.lensCrosshair} />
              <span className={styles.lensLabel}>2×</span>
            </span>
          )}
        </div>
      </div>
      <p id={hintId} className={styles.inspectorHint}>
        {lensEnabled
          ? "Move or drag the lens across the image. With the image focused, use the arrow keys for precise inspection."
          : "Use + and − to zoom, then scroll to explore. Turn on the inspection lens for a closer look."}
      </p>
    </div>
  );
}
