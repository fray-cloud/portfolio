"use client";

import { ReactNode } from "react";
import AnimatedSection from "@/components/animations/AnimatedSection";

export default function BlogHighlightsWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return <AnimatedSection>{children}</AnimatedSection>;
}
