"use client";

import { useEffect, useState, type CSSProperties } from "react";

import { MOODS } from "@/app/lib/moods";

// ═══════════════════════════════════════════════════════════════
// VIBE PLAY — background + empty GameBoy Color shell (skeleton)
// No cartridges, no game data, no filter logic — just the frame.
// ═══════════════════════════════════════════════════════════════

type Dir = "up" | "down" | "left" | "right";

export default function GameBoySkeleton() {
  const [aPress, setAPress] = useState(false);
  const [bPress, setBPress] = useState(false);
  const [stPress, setStPress] = useState(false);
  const [selPress, setSelPress] = useState(false);
  const [cPress, setCPress] = useState(false);
  const [dPress, setDPress] = useState<Dir | null>(null);

  const vibeC = "#a78bfa"; // default "ALL" vibe color, for glow/accents

  // ── Vibe carousel ────────────────────────────────────────────────────────
  // Which mood is centred. Left/right on the D-pad moves it, wrapping around.
  const [moodIndex, setMoodIndex] = useState(0);
  const stepMood = (delta: number) =>
    setMoodIndex((i) => (i + delta + MOODS.length) % MOODS.length);

  // ── Result screen ────────────────────────────────────────────────────────
  // A confirms the centred vibe, fetching a game for it. Start rerolls by
  // hitting the API again for a fresh pick; B drops the pick and returns to
  // the carousel.
  type ScreenView = "carousel" | "loading" | "result" | "error";
  type Game = {
    id: number;
    name: string;
    summary?: string;
    coverUrl?: string | null;
  };

  const [screen, setScreen] = useState<ScreenView>("carousel");
  const [pickedGame, setPickedGame] = useState<Game | null>(null);
  // Every game already shown for the current vibe, so reroll doesn't repeat
  // one until the whole (deterministic, rating-sorted) result set is used up.
  const [seenIds, setSeenIds] = useState<Set<number>>(new Set());

  // Root layout metadata is cached by next-server and often will not
  // update the browser tab until `next dev` is restarted. Set it here
  // so Fast Refresh of this client component updates the tab immediately.
  useEffect(() => {
    document.title = "Vibe Game Match";
  }, []);

  const pickRandomGame = (pool: Game[], excludeIds: Set<number>) => {
    if (pool.length === 0) return null;
    const unseen = pool.filter((g) => !excludeIds.has(g.id));
    const candidates = unseen.length > 0 ? unseen : pool;
    return candidates[Math.floor(Math.random() * candidates.length)];
  };

  const fetchAndPick = async (excludeIds: Set<number>) => {
    setScreen("loading");
    try {
      const res = await fetch(`/api/games?mood=${MOODS[moodIndex].id}`);
      const games: Game[] = await res.json();
      if (!Array.isArray(games) || games.length === 0) {
        setScreen("error");
        return;
      }
      const picked = pickRandomGame(games, excludeIds);
      setPickedGame(picked);
      setSeenIds(picked ? new Set(excludeIds).add(picked.id) : excludeIds);
      setScreen("result");
    } catch {
      setScreen("error");
    }
  };

  const confirmVibe = () => {
    setSeenIds(new Set());
    fetchAndPick(new Set());
  };

  const reroll = () => fetchAndPick(seenIds);

  const backToVibes = () => {
    setScreen("carousel");
    setPickedGame(null);
    setSeenIds(new Set());
  };

  const viewGame = () => {
    // Placeholder until the destination (IGDB page vs. store search) is decided.
    console.log("view game", pickedGame);
  };

  const scrAccent = "#baff29";   // lime — eyebrow, pill, active dot
  const scrSub = "#5a5a68";      // counter, chevrons, inactive dots
  const SCR_U = 8;               // the one spacing unit the screen is built on

  // Soft tile fills behind each vibe emoji. Cozy skips the index-0 red
  // hue and uses a warm cocoa instead.
  const moodTint = (i: number) => {
    if (MOODS[i].id === "cozy") {
      return "linear-gradient(150deg, hsl(24 28% 24%), hsl(20 30% 11%))";
    }
    const h = (i * 67) % 360;
    return `linear-gradient(150deg, hsl(${h} 18% 26%), hsl(${h} 20% 12%))`;
  };

  // ── Atomic Purple Translucent shell palette ──────────────────────────────
  const shellBg =
    "linear-gradient(158deg, rgba(200,168,255,0.07) 0%, rgba(148,88,248,0.11) 55%, rgba(122,60,228,0.20) 100%)";
  const shellBrd = "1.69px solid rgba(180,132,255,0.24)";
  const shellShd = [
    "inset 0 1.69px 0 rgba(255,255,255,0.22)",
    "inset 1.69px 0 0 rgba(255,255,255,0.10)",
    "inset -1.12px 0 0 rgba(120,70,220,0.14)",
    "inset 0 -1.69px 0 rgba(80,40,180,0.20)",
    "0 0 0 1.13px rgba(120,64,220,0.22)",
    "0 27px 78.75px rgba(100,50,210,0.40)",
    "0 6.75px 22.5px rgba(0,0,0,0.55)",
  ].join(", ");
  const dpadRing =
    "radial-gradient(circle at 38% 34%, rgba(90,70,200,0.82), rgba(46,26,148,0.95))";
  const dpadRingBrd = "1.69px solid rgba(100,82,210,0.60)";
  const dpadRingShd =
    "inset 0 3.38px 9px rgba(0,0,0,0.55), inset 0 -1.12px 0 rgba(150,120,255,0.10), 0 2.25px 11.25px rgba(0,0,0,0.35)";
  // ── Unified control theme — shared by the D-pad and the A/B buttons ──────
  const ctrlBg = "#1a1828";
  const ctrlBgPress = "#2c2842";
  const ctrlInk = "rgba(160,140,220,0.65)";
  const ctrlInkPress = "rgba(200,175,255,0.90)";

  const btnBg = ctrlBg;
  const btnBrd = "1.13px solid rgba(100,80,200,0.28)";
  const btnShd = "0 4.5px 0 rgba(0,0,0,0.65), inset 0 1.13px 0 rgba(255,255,255,0.07)";
  const btnShd2 = "0 0 15.75px rgba(160,100,255,0.50), inset 0 1.13px 0 rgba(255,255,255,0.10)";
  const pillBg = "rgba(20,10,65,0.96)";
  const pillBrd = "1.13px solid rgba(90,56,200,0.45)";
  const pillShd =
    "inset 0 1.13px 3.38px rgba(0,0,0,0.70), inset 0 -1.12px 0 rgba(130,90,220,0.12)";

  // Hand-drawn marker face for the COLOR lockup, loaded from Google Fonts above.
  const logoFont = "'Gochi Hand', cursive";

  const screwPosts: [number, number][] = [
    [18, 298],
    [126, 284],
    [160, 315],
    [182, 356],
    [277, 295],
    [275, 358],
    [113, 389],
    [259, 401],
  ];
  const smallScrews: [number, number][] = [
    [158, 288],
    [189, 279],
    [253, 306],
    [261, 347],
    [178, 378],
  ];

  // Directional arrow drawn with the CSS border-triangle trick.
  const arrow = (dir: Dir, active: boolean) => {
    const col = active ? ctrlInkPress : ctrlInk;
    const s = 4.2; // half-width of the triangle
    const h = s * 1.35; // triangle height
    const base: CSSProperties = {
      position: "absolute",
      width: 0,
      height: 0,
      left: "50%",
      top: "50%",
    };

    if (dir === "up")
      return (
        <div
          style={{
            ...base,
            transform: `translate(-${s}px, -${h * 0.9}px)`,
            borderLeft: `${s}px solid transparent`,
            borderRight: `${s}px solid transparent`,
            borderBottom: `${h}px solid ${col}`,
          }}
        />
      );
    if (dir === "down")
      return (
        <div
          style={{
            ...base,
            transform: `translate(-${s}px, -${h * 0.1}px)`,
            borderLeft: `${s}px solid transparent`,
            borderRight: `${s}px solid transparent`,
            borderTop: `${h}px solid ${col}`,
          }}
        />
      );
    if (dir === "left")
      return (
        <div
          style={{
            ...base,
            transform: `translate(-${h * 0.9}px, -${s}px)`,
            borderTop: `${s}px solid transparent`,
            borderBottom: `${s}px solid transparent`,
            borderRight: `${h}px solid ${col}`,
          }}
        />
      );
    return (
      <div
        style={{
          ...base,
          transform: `translate(-${h * 0.1}px, -${s}px)`,
          borderTop: `${s}px solid transparent`,
          borderBottom: `${s}px solid transparent`,
          borderLeft: `${h}px solid ${col}`,
        }}
      />
    );
  };

  const arm = (dir: Dir, s: CSSProperties) => (
    <button
      key={dir}
      onPointerDown={() => setDPress(dir)}
      onPointerUp={() => setDPress(null)}
      onPointerLeave={() => setDPress(null)}
      onClick={() => {
        if (screen !== "carousel") return;
        if (dir === "left") stepMood(-1);
        if (dir === "right") stepMood(1);
      }}
      aria-label={`D-pad ${dir}`}
      style={{
        position: "absolute",
        border: "none",
        padding: 0,
        cursor: "pointer",
        transition: "background 0.08s",
        ...s,
      }}
    >
      {arrow(dir, dPress === dir)}
    </button>
  );

  const T = "34%";

  // ── Moulded D-pad ────────────────────────────────────────────────────────
  // The cross is five segments of ONE moulded piece, not five separate keys.
  // Every segment paints the same gradient, sized to the whole cross and offset
  // to its own position, so light falls across the pad with no seams where the
  // segments meet.
  const PAD_BOX = 69.75;
  const PAD_SEG = PAD_BOX * 0.34; // one segment — matches T
  const PAD_MOLD =
    "linear-gradient(180deg,#26243c 0%,#1a1828 55%,#131120 100%)";

  const padSegs: {
    key: Dir | "center";
    geo: CSSProperties;
    pos: [number, number];
  }[] = [
    { key: "up", geo: { top: 0, left: T, width: T, height: T, borderRadius: "3.38px 3.38px 0 0" }, pos: [PAD_SEG, 0] },
    { key: "down", geo: { bottom: 0, left: T, width: T, height: T, borderRadius: "0 0 3.38px 3.38px" }, pos: [PAD_SEG, PAD_BOX - PAD_SEG] },
    { key: "left", geo: { left: 0, top: T, width: T, height: T, borderRadius: "3.38px 0 0 3.38px" }, pos: [0, PAD_SEG] },
    { key: "right", geo: { right: 0, top: T, width: T, height: T, borderRadius: "0 3.38px 3.38px 0" }, pos: [PAD_BOX - PAD_SEG, PAD_SEG] },
    { key: "center", geo: { left: T, top: T, width: T, height: T }, pos: [PAD_SEG, PAD_SEG] },
  ];

  // Resting segments carry the shared moulding; a pressed one goes flat.
  const segFill = (pos: [number, number], pressed: boolean): CSSProperties =>
    pressed
      ? { background: ctrlBgPress }
      : {
          backgroundImage: PAD_MOLD,
          backgroundSize: `${PAD_BOX}px ${PAD_BOX}px`,
          backgroundPosition: `-${pos[0]}px -${pos[1]}px`,
        };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#07050e",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "36px 16px 60px",
        fontFamily: "'DM Sans', sans-serif",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;500;700;800;900&family=DM+Sans:ital,wght@0,400;0,500;0,700;1,500;1,700&family=Gochi+Hand&family=Space+Mono:wght@400;700&display=swap');
      `}</style>

      {/* Ambient glow */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            top: "18%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "540px",
            height: "540px",
            borderRadius: "50%",
            background: "#7c3aed",
            opacity: 0.08,
            filter: "blur(101.25px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "22%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "315px",
            height: "618.75px",
            borderRadius: "50%",
            background: vibeC,
            opacity: 0.05,
            filter: "blur(78.75px)",
          }}
        />
      </div>

      {/* Title */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          textAlign: "center",
          marginBottom: "36px",
        }}
      >
        <h1
          style={{
            fontFamily: "'Unbounded', sans-serif",
            fontSize: "clamp(0.9rem,3vw,1.2rem)",
            color: "#eeeef8",
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}
        >
          <span style={{ color: vibeC }}>VIBE</span> GAME MATCH
        </h1>
      </div>

      {/* ═══════════════════════════════════════════════
          GAME BOY COLOR — ATOMIC PURPLE TRANSLUCENT
          Device: 295 × 506px (~78mm × 133.5mm — real GBC size)
          ═══════════════════════════════════════════════ */}
      <div
        // Rendered at true-to-life size (295 x 506px ≈ 78mm x 133.5mm) on all
        // screens, including mobile (e.g. iPhone Pro Max), since it comfortably
        // fits without needing to shrink.
        style={{ position: "relative", zIndex: 10, transformOrigin: "top center" }}
      >
        <div
          style={{
            width: "294.75px",
            height: "506.25px",
            position: "relative",
            background: shellBg,
            border: shellBrd,
            boxShadow: shellShd,
            borderRadius: "24.75px 24.75px 42.75px 42.75px",
            overflow: "hidden",
          }}
        >
          {/* Corner caps */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "40.5px",
              height: "40.5px",
              background:
                "linear-gradient(135deg,rgba(170,118,255,0.32),rgba(100,58,230,0.18))",
              borderRadius: "24.75px 0 0 0",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "40.5px",
              height: "40.5px",
              background:
                "linear-gradient(225deg,rgba(170,118,255,0.32),rgba(100,58,230,0.18))",
              borderRadius: "0 24.75px 0 0",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "49.5px",
              height: "49.5px",
              background:
                "linear-gradient(45deg,rgba(140,90,240,0.28),rgba(80,40,200,0.14))",
              borderRadius: "0 0 0 42.75px",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: "49.5px",
              height: "49.5px",
              background:
                "linear-gradient(315deg,rgba(140,90,240,0.28),rgba(80,40,200,0.14))",
              borderRadius: "0 0 42.75px 0",
              pointerEvents: "none",
            }}
          />

          {/* IR port */}
          <div
            style={{
              position: "absolute",
              top: "0px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "29.25px",
              height: "5.63px",
              background: "rgba(90,48,200,0.55)",
              borderRadius: "0 0 3.38px 3.38px",
              border: "0.56px solid rgba(130,85,240,0.30)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "2.25px",
              left: "50%",
              transform: "translateX(18px)",
              fontSize: "3.94px",
              color: "rgba(100,72,200,0.45)",
              fontFamily: "'Unbounded', sans-serif",
              letterSpacing: "0.10em",
            }}
          >
            COMM
          </div>

          {/* Internals visible through clear shell */}
          <div
            style={{
              position: "absolute",
              top: "414px",
              left: "15.75px",
              width: "78.75px",
              height: "65.25px",
              background: "#0b2e1a",
              border: "0.56px solid rgba(32,172,74,0.22)",
              borderRadius: "2.25px",
              opacity: 0.72,
            }}
          >
            {[9, 18, 27, 38, 47].map((y) => (
              <div
                key={y}
                style={{
                  position: "absolute",
                  top: `${y}px`,
                  left: "5.63px",
                  right: "5.63px",
                  height: "1.13px",
                  background: "rgba(32,172,74,0.14)",
                }}
              />
            ))}
            {[12, 28, 50].map((x) => (
              <div
                key={x}
                style={{
                  position: "absolute",
                  left: `${x}px`,
                  top: "5.63px",
                  bottom: "5.63px",
                  width: "1.13px",
                  background: "rgba(32,172,74,0.10)",
                }}
              />
            ))}
            <div
              style={{
                position: "absolute",
                top: "7.88px",
                left: "7.88px",
                width: "24.75px",
                height: "18px",
                background: "rgba(20,96,44,0.65)",
                border: "0.56px solid rgba(32,172,74,0.22)",
                borderRadius: "1.13px",
              }}
            />
            {[
              [46, 8],
              [54, 22],
              [46, 36],
              [54, 44],
            ].map(([lx, ty]) => (
              <div
                key={`${lx}${ty}`}
                style={{
                  position: "absolute",
                  left: `${lx}px`,
                  top: `${ty}px`,
                  width: "6.75px",
                  height: "6.75px",
                  borderRadius: "50%",
                  background: "rgba(26,140,60,0.28)",
                  border: "0.56px solid rgba(32,172,74,0.20)",
                }}
              />
            ))}
          </div>
          <div
            style={{
              position: "absolute",
              top: "396px",
              left: "196.88px",
              width: "81px",
              height: "81px",
              borderRadius: "50%",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at 44% 42%, rgba(195,108,28,0.38), rgba(100,44,8,0.18), transparent 70%)",
                opacity: 0.8,
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: "18px",
                borderRadius: "50%",
                border: "1.13px solid rgba(175,92,22,0.22)",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: "29.25px",
                borderRadius: "50%",
                border: "1.13px solid rgba(155,76,16,0.16)",
              }}
            />
          </div>

          {screwPosts.map(([sx, sy]) => (
            <div
              key={`${sx}${sy}`}
              style={{
                position: "absolute",
                left: `${sx - 5}px`,
                top: `${sy - 5}px`,
                width: "11.25px",
                height: "11.25px",
                borderRadius: "50%",
                background: "rgba(90,55,200,0.22)",
                border: "0.56px solid rgba(140,100,240,0.28)",
                pointerEvents: "none",
              }}
            />
          ))}
          {smallScrews.map(([sx, sy]) => (
            <div
              key={`sm${sx}${sy}`}
              style={{
                position: "absolute",
                left: `${sx - 3}px`,
                top: `${sy - 3}px`,
                width: "6.75px",
                height: "6.75px",
                borderRadius: "50%",
                background: "rgba(130,85,230,0.18)",
                border: "0.56px solid rgba(160,120,255,0.20)",
                pointerEvents: "none",
              }}
            />
          ))}

          {/* Black bezel + empty screen */}
          <div
            style={{
              position: "absolute",
              top: "38.25px",
              left: "15.75px",
              right: "15.75px",
              height: "200.25px",
              background: "#050310",
              borderRadius: "6.75px",
              boxShadow: "0 0 0 1.13px rgba(0,0,0,0.90), inset 0 0 11.25px rgba(0,0,0,0.80)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "16px",
                left: "13.5px",
                right: "13.5px",
                height: "156px",
                borderRadius: "2.25px",
                overflow: "hidden",
                background: "#030608",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* ── Vibe carousel ────────────────────────────────────────
                  Everything here is derived from MOODS, so the counter, the
                  dots and the tiles all follow the list in app/lib/moods.ts. */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  padding: `${SCR_U}px 12px ${SCR_U}px`,
                  fontFamily: "'Space Mono', ui-monospace, monospace",
                }}
              >
              {screen === "carousel" && (
                <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingBottom: `${SCR_U - 2}px`,
                  }}
                >
                  <div
                    style={{
                      fontSize: "8px",
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      color: scrAccent,
                      lineHeight: 1,
                    }}
                  >
                    Pick your vibe
                  </div>
                  <div
                    style={{
                      fontSize: "8px",
                      letterSpacing: "1.5px",
                      color: scrSub,
                      lineHeight: 1,
                    }}
                  >
                    {moodIndex + 1} / {MOODS.length}
                  </div>
                </div>

                {/* stage — flex:1 so it can never overflow the 156px screen */}
                <div
                  style={{
                    position: "relative",
                    flex: 1,
                    minHeight: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%,-50%)",
                      width: "150px",
                      height: "150px",
                      borderRadius: "50%",
                      pointerEvents: "none",
                      background: `radial-gradient(circle, ${scrAccent}59 0%, transparent 65%)`,
                    }}
                  />

                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: "12px",
                      lineHeight: 1,
                      color: scrSub,
                      opacity: 0.7,
                      zIndex: 2,
                    }}
                  >
                    &#8249;
                  </div>

                  <div
                    style={{
                      position: "relative",
                      zIndex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "12px",
                    }}
                  >
                    {[-1, 0, 1].map((offset) => {
                      const i =
                        (moodIndex + offset + MOODS.length) % MOODS.length;
                      const isCentre = offset === 0;
                      const size = isCentre ? 84 : 38;
                      return (
                        <div
                          key={MOODS[i].id}
                          title={MOODS[i].label}
                          style={{
                            position: "relative",
                            width: `${size}px`,
                            height: `${size}px`,
                            borderRadius: "14px",
                            overflow: "hidden",
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: moodTint(i),
                            opacity: isCentre ? 1 : 0.45,
                            filter: isCentre ? undefined : "saturate(0.85)",
                            boxShadow: isCentre
                              ? "0 12px 24px rgba(0,0,0,0.5), 0 0 0 2px rgba(255,255,255,0.15)"
                              : "0 6px 14px rgba(0,0,0,0.4)",
                            transition: "all 0.14s",
                          }}
                        >
                          <span
                            aria-hidden
                            style={{
                              position: "relative",
                              zIndex: 1,
                              fontSize: isCentre ? "42px" : "20px",
                              lineHeight: 1,
                              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.45))",
                            }}
                          >
                            {MOODS[i].emoji}
                          </span>
                          {/* sheen */}
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              pointerEvents: "none",
                              background:
                                "linear-gradient(155deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.12) 30%, transparent 55%)",
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: "12px",
                      lineHeight: 1,
                      color: scrSub,
                      opacity: 0.7,
                      zIndex: 2,
                    }}
                  >
                    &#8250;
                  </div>
                </div>

                <div
                  style={{
                    alignSelf: "center",
                    marginTop: `${SCR_U}px`,
                    padding: "3px 12px",
                    border: `1px solid ${scrAccent}`,
                    color: scrAccent,
                    fontSize: "8px",
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    borderRadius: "999px",
                    lineHeight: 1,
                  }}
                >
                  {MOODS[moodIndex].label}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "5px",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: `${SCR_U}px`,
                  }}
                >
                  {MOODS.map((m, i) => (
                    <div
                      key={m.id}
                      style={{
                        width: i === moodIndex ? "12px" : "4px",
                        height: "4px",
                        borderRadius: "999px",
                        background: i === moodIndex ? scrAccent : scrSub,
                        opacity: i === moodIndex ? 1 : 0.55,
                        transition: "all 0.14s",
                      }}
                    />
                  ))}
                </div>
                </>
              )}

              {screen === "loading" && (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "10px",
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      color: scrSub,
                    }}
                  >
                    Loading&hellip;
                  </div>
                </div>
              )}

              {screen === "error" && (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: `${SCR_U}px`,
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "9px",
                      letterSpacing: "1px",
                      color: scrSub,
                      lineHeight: 1.4,
                    }}
                  >
                    Couldn&rsquo;t load games.
                    <br />
                    Press B to try another vibe.
                  </div>
                </div>
              )}

              {screen === "result" && pickedGame && (
                <>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      paddingBottom: `${SCR_U - 2}px`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "8px",
                        letterSpacing: "1.5px",
                        textTransform: "uppercase",
                        color: scrAccent,
                        lineHeight: 1,
                      }}
                    >
                      Vibe: {MOODS[moodIndex].label}
                    </div>
                    <div
                      style={{
                        fontSize: "8px",
                        letterSpacing: "1.5px",
                        color: scrSub,
                        lineHeight: 1,
                      }}
                    >
                      Today&rsquo;s pick
                    </div>
                  </div>

                  <div
                    style={{
                      flex: 1,
                      minHeight: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        width: "64px",
                        height: "64px",
                        flexShrink: 0,
                        borderRadius: "8px",
                        overflow: "hidden",
                        background: pickedGame.coverUrl
                          ? `url(${pickedGame.coverUrl}) center/cover`
                          : moodTint(moodIndex),
                        boxShadow:
                          "0 6px 14px rgba(0,0,0,0.5), 0 0 0 1.5px rgba(255,255,255,0.12)",
                      }}
                    />

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "'Unbounded', sans-serif",
                          fontWeight: 800,
                          fontSize: "9px",
                          color: "#eeeef8",
                          lineHeight: 1.2,
                        }}
                      >
                        {pickedGame.name}
                      </div>
                      <div
                        style={{
                          fontSize: "6.5px",
                          color: scrSub,
                          lineHeight: 1.4,
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {pickedGame.summary ?? ""}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                      justifyContent: "center",
                      marginTop: `${SCR_U}px`,
                    }}
                  >
                    <div
                      style={{
                        padding: "3px 10px",
                        border: `1px solid ${scrSub}`,
                        color: scrSub,
                        fontSize: "7px",
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                        borderRadius: "999px",
                        lineHeight: 1,
                      }}
                    >
                      &#8635; Reroll (Start)
                    </div>
                    <div
                      style={{
                        padding: "3px 10px",
                        background: scrAccent,
                        color: "#12210a",
                        fontSize: "7px",
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                        borderRadius: "999px",
                        lineHeight: 1,
                        fontWeight: 700,
                      }}
                    >
                      View game (A)
                    </div>
                  </div>
                </>
              )}
              </div>
            </div>

            {/* GAME BOY COLOR logo */}
            <div
              style={{
                position: "absolute",
                top: "179px",
                left: 0,
                right: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontStyle: "italic",
                  fontSize: "9.56px",
                  fontWeight: 500,
                  color: "#68658a",
                  letterSpacing: "0.01em",
                }}
              >
                GAME BOY&nbsp;
              </span>
              {(
                [
                  // the five Game Boy Color console colourways — the sixth,
                  // Atomic Purple, is the shell itself
                  ["C", "#E8447F"], // Berry
                  ["O", "#A855F7"], // Grape
                  ["L", "#84CC16"], // Kiwi
                  ["o", "#FACC15"], // Dandelion
                  ["R", "#14B8A6"], // Teal
                ] as [string, string][]
              ).map(([ch, col], i) => (
                <span
                  key={i}
                  style={{
                    fontFamily: logoFont,
                    fontSize: "12px",
                    fontWeight: 400,
                    color: col,
                    lineHeight: 1,
                    letterSpacing: "0.01em",
                  }}
                >
                  {ch}
                </span>
              ))}
            </div>
          </div>

          {/* Power indicator */}
          <div style={{ position: "absolute", top: "247.5px", left: "20.25px" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "4.5px" }}>
              <div
                style={{
                  width: "7.88px",
                  height: "7.88px",
                  borderRadius: "50%",
                  background: "#ff2020",
                  boxShadow: "0 0 5.63px #ff2020, 0 0 13.5px #ff202058",
                  flexShrink: 0,
                }}
              />
              <div style={{ display: "flex", gap: "2.25px", alignItems: "flex-end" }}>
                {[6, 9, 12].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      width: "3.94px",
                      height: `${h}px`,
                      background: "rgba(96,62,200,0.50)",
                      borderRadius: "1.13px",
                    }}
                  />
                ))}
              </div>
            </div>
            <div
              style={{
                marginTop: "3.38px",
                fontSize: "5.06px",
                color: "rgba(80,55,165,0.55)",
                fontFamily: "'Unbounded', sans-serif",
                letterSpacing: "0.08em",
              }}
            >
              POWER
            </div>
          </div>

          {/* Nintendo badge */}
          <div
            style={{
              position: "absolute",
              top: "245.25px",
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                padding: "3.38px 18px",
                borderRadius: "13.5px",
                border: "0.56px solid rgba(110,76,220,0.22)",
                background: "rgba(50,26,120,0.10)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontStyle: "italic",
                  fontWeight: 700,
                  fontSize: "7.88px",
                  color: "rgba(120,92,210,0.42)",
                  letterSpacing: "0.03em",
                  // cancels the trailing gap letter-spacing leaves after the last
                  // character, so the word sits optically centred in the pill
                  marginRight: "-0.03em",
                }}
              >
                Nintendo
              </span>
            </div>
          </div>

          {/* D-pad */}
          <div
            style={{
              position: "absolute",
              left: "14.63px",
              top: "285.75px",
              width: "108px",
              height: "108px",
              borderRadius: "50%",
              background: dpadRing,
              border: dpadRingBrd,
              boxShadow: dpadRingShd,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "69.75px",
                height: "69.75px",
                filter: "drop-shadow(0 2.5px 0 rgba(0,0,0,0.55))",
              }}
            >
              {/* the five segments of the moulded cross */}
              {padSegs.map(({ key, geo, pos }) =>
                key === "center" ? (
                  <button
                    key="center"
                    onPointerDown={() => setCPress(true)}
                    onPointerUp={() => setCPress(false)}
                    onPointerLeave={() => setCPress(false)}
                    aria-label="D-pad centre"
                    style={{
                      position: "absolute",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      transition: "background 0.08s",
                      ...segFill(pos, cPress),
                      ...geo,
                    }}
                  />
                ) : (
                  arm(key, { ...segFill(pos, dPress === key), ...geo })
                )
              )}

              {/* centre divot — moulded into the cross rather than sitting on
                  top of it, so there is no ring: just a dark top inner edge and
                  a light bottom rim, which is how an indentation catches light.
                  Pointer-transparent so the press lands on the centre segment. */}
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: "13px",
                  height: "13px",
                  marginLeft: "-6.5px",
                  marginTop: "-6.5px",
                  borderRadius: "50%",
                  background: cPress ? "rgba(0,0,0,0.40)" : "rgba(0,0,0,0.28)",
                  boxShadow: cPress
                    ? "inset 0 2.1px 2.8px rgba(0,0,0,0.95), inset 0 -1px 1px rgba(255,255,255,0.09)"
                    : "inset 0 1.7px 2.2px rgba(0,0,0,0.90), inset 0 -1px 1px rgba(255,255,255,0.12), 0 0.6px 0 rgba(255,255,255,0.06)",
                  transition: "all 0.08s",
                  pointerEvents: "none",
                }}
              />
            </div>
          </div>

          {/* B button */}
          <button
            onPointerDown={() => setBPress(true)}
            onPointerUp={() => setBPress(false)}
            onPointerLeave={() => setBPress(false)}
            onClick={() => {
              if (screen === "result" || screen === "error") backToVibes();
            }}
            style={{
              position: "absolute",
              left: "174.38px",
              top: "327.38px",
              width: "38.25px",
              height: "38.25px",
              borderRadius: "50%",
              background: bPress ? ctrlBgPress : ctrlBg,
              border: btnBrd,
              boxShadow: bPress ? btnShd2 : btnShd,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: bPress ? "translateY(3.38px)" : "none",
              transition: "all 0.08s",
            }}
          >
            <span
              style={{
                fontSize: "10.13px",
                fontFamily: "'Unbounded', sans-serif",
                fontWeight: 800,
                color: bPress ? ctrlInkPress : ctrlInk,
              }}
            >
              B
            </span>
          </button>

          {/* A button */}
          <button
            onPointerDown={() => setAPress(true)}
            onPointerUp={() => setAPress(false)}
            onPointerLeave={() => setAPress(false)}
            onClick={() => {
              if (screen === "carousel") confirmVibe();
              if (screen === "result") viewGame();
            }}
            style={{
              position: "absolute",
              left: "213.75px",
              top: "291.38px",
              width: "38.25px",
              height: "38.25px",
              borderRadius: "50%",
              background: aPress ? ctrlBgPress : ctrlBg,
              border: btnBrd,
              boxShadow: aPress ? btnShd2 : btnShd,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: aPress ? "translateY(3.38px)" : "none",
              transition: "all 0.08s",
            }}
          >
            <span
              style={{
                fontSize: "10.13px",
                fontFamily: "'Unbounded', sans-serif",
                fontWeight: 800,
                color: aPress ? ctrlInkPress : ctrlInk,
              }}
            >
              A
            </span>
          </button>

          {/* SELECT */}
          <button
            onPointerDown={() => setSelPress(true)}
            onPointerUp={() => setSelPress(false)}
            onPointerLeave={() => setSelPress(false)}
            aria-label="Select"
            style={{
              position: "absolute",
              left: "92.25px",
              top: "414px",
              width: "49.5px",
              height: "14.63px",
              borderRadius: "6.75px",
              background: selPress ? "rgba(44,24,120,0.98)" : pillBg,
              border: pillBrd,
              boxShadow: selPress
                ? "inset 0 1.13px 3.38px rgba(0,0,0,0.80), 0 0 11.25px rgba(130,90,255,0.35)"
                : pillShd,
              cursor: "pointer",
              transition: "all 0.08s",
            }}
          />
          <span
            style={{
              position: "absolute",
              left: "92.25px",
              top: "430.88px",
              width: "49.5px",
              textAlign: "center",
              fontSize: "4.5px",
              color: selPress ? "rgba(140,110,240,0.72)" : "rgba(80,55,168,0.52)",
              fontFamily: "'Unbounded', sans-serif",
              letterSpacing: "0.06em",
              transition: "color 0.08s",
            }}
          >
            SELECT
          </span>

          {/* START */}
          <button
            onPointerDown={() => setStPress(true)}
            onPointerUp={() => setStPress(false)}
            onPointerLeave={() => setStPress(false)}
            onClick={() => {
              if (screen === "result") reroll();
            }}
            style={{
              position: "absolute",
              left: "150.75px",
              top: "414px",
              width: "49.5px",
              height: "14.63px",
              borderRadius: "6.75px",
              background: stPress ? "rgba(44,24,120,0.98)" : pillBg,
              border: pillBrd,
              boxShadow: stPress
                ? "inset 0 1.13px 3.38px rgba(0,0,0,0.80), 0 0 11.25px rgba(130,90,255,0.35)"
                : pillShd,
              cursor: "pointer",
              transition: "all 0.08s",
            }}
          />
          <span
            style={{
              position: "absolute",
              left: "150.75px",
              top: "430.88px",
              width: "49.5px",
              textAlign: "center",
              fontSize: "4.5px",
              color: stPress ? "rgba(140,110,240,0.72)" : "rgba(80,55,168,0.52)",
              fontFamily: "'Unbounded', sans-serif",
              letterSpacing: "0.06em",
              transition: "color 0.08s",
            }}
          >
            START
          </span>

          {/* Speaker grill */}
          <div
            style={{
              position: "absolute",
              left: "196.88px",
              top: "396px",
              width: "81px",
              height: "81px",
              borderRadius: "50%",
              overflow: "hidden",
              border: "0.56px solid rgba(100,65,200,0.22)",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at 46% 44%, rgba(190,100,24,0.32), rgba(90,38,6,0.12), transparent 68%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "grid",
                gridTemplateColumns: "repeat(8,1fr)",
                gap: "3.38px",
                padding: "6.75px",
              }}
            >
              {Array.from({ length: 64 }).map((_, i) => {
                const col = i % 8;
                const row = Math.floor(i / 8);
                const dx = col - 3.5;
                const dy = row - 3.5;
                const inside = dx * dx + dy * dy <= 12.5;
                return (
                  <div
                    key={i}
                    style={{
                      width: "5.63px",
                      height: "5.63px",
                      borderRadius: "50%",
                      background: inside ? "rgba(50,28,120,0.68)" : "transparent",
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
