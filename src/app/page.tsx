"use client";
import { useCallback, useState } from "react";
import Preloader from "@/components/Preloader";
import Hero from "@/components/hero/Hero";
import Manifesto from "@/components/Manifesto";
import Work from "@/components/work/Work";
import Process from "@/components/Process";
import GravityWell from "@/components/GravityWell";
import NotesPreview from "@/components/notes/NotesPreview";
import Log from "@/components/Log";
import Contact from "@/components/Contact";

export default function Page() {
  const [ready, setReady] = useState(false);
  const onDone = useCallback(() => setReady(true), []);
  return (
    <>
      <Preloader onDone={onDone} />
      <main>
        <Hero ready={ready} />
        <Manifesto />
        <Work />
        <Process />
        <GravityWell />
        <NotesPreview />
        <Log />
        <Contact />
      </main>
    </>
  );
}
