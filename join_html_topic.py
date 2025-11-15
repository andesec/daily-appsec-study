#!/usr/bin/env python3
import os
import re
import sys
from typing import List, Tuple
from bs4 import BeautifulSoup

LESSONS_ROOT = "lessons"
TEMPLATE_SUFFIX = "-template.html"
OUTPUT_SUFFIX = ".html"

FRAGMENT_PATTERN = re.compile(r"^(\d+)(?:-(\d+))?\.html$", re.IGNORECASE)


def log(msg):
    print(msg, file=sys.stderr)


def find_topic_dirs(root: str) -> List[str]:
    dirs = []
    for entry in sorted(os.listdir(root)):
        full = os.path.join(root, entry)
        if os.path.isdir(full):
            # topic folders must contain a template file
            if any(f.endswith(TEMPLATE_SUFFIX) for f in os.listdir(full)):
                dirs.append(full)
    return dirs


def find_template(topic_dir: str) -> str:
    for f in os.listdir(topic_dir):
        if f.endswith(TEMPLATE_SUFFIX):
            return os.path.join(topic_dir, f)
    raise FileNotFoundError(f"No template file found in {topic_dir}")


def find_fragments(topic_dir: str) -> List[Tuple[int, int, str]]:
    """Return list of (start, end, path) for each fragment."""
    fragments = []
    for fname in os.listdir(topic_dir):
        if fname.endswith(TEMPLATE_SUFFIX):
            continue
        m = FRAGMENT_PATTERN.match(fname)
        if m:
            start = int(m.group(1))
            end = int(m.group(2)) if m.group(2) else start
            if end < start:
                log(f"[WARN] Fragment {fname} has reversed range in {topic_dir}")
            fragments.append((start, end, os.path.join(topic_dir, fname)))
    fragments.sort(key=lambda x: x[0])
    return fragments


def check_ranges(fragments: List[Tuple[int, int, str]], topic_name: str):
    used = set()
    overlaps = []
    for start, end, path in fragments:
        for i in range(start, end + 1):
            if i in used:
                overlaps.append(i)
            used.add(i)
    if overlaps:
        log(f"[WARN] Overlapping section numbers detected in topic '{topic_name}': {sorted(set(overlaps))}")


def extract_sections(fragment_path: str) -> List[object]:
    """Extract <section class='card'> blocks from a fragment."""
    with open(fragment_path, "r", encoding="utf-8") as f:
        frag_html = f.read()

    soup = BeautifulSoup(frag_html, "html.parser")
    sections = soup.find_all("section", class_="card")
    if not sections:
        log(f"[WARN] No <section class='card'> found in {fragment_path}")
    return sections


def remove_existing_sections(container):
    for section in list(container.find_all("section", class_="card", recursive=False)):
        section.decompose()


def find_header_and_footer(container):
    header = container.find("header", class_="card")
    footer = container.find("footer")
    return header, footer


def build_topic(topic_dir: str, lessons_root: str):
    topic_name = os.path.basename(topic_dir)
    log(f"[INFO] Processing topic: {topic_name}")

    template_path = find_template(topic_dir)
    fragments = find_fragments(topic_dir)
    check_ranges(fragments, topic_name)

    with open(template_path, "r", encoding="utf-8") as f:
        template_html = f.read()

    soup = BeautifulSoup(template_html, "html.parser")
    container = soup.find("div", class_="container")
    if not container:
        log(f"[ERROR] Template in {topic_name} has no <div class='container'>.")
        return False

    header, footer = find_header_and_footer(container)
    if not header or not footer:
        log(f"[ERROR] Template missing header or footer in {topic_name}.")
        return False

    # Remove old sections
    remove_existing_sections(container)

    # Insert new sections after header, before footer
    insertion_point = footer
    for _, _, frag_path in fragments:
        log(f"[INFO] Inserting fragment: {frag_path}")
        sections = extract_sections(frag_path)
        for s in sections:
            insertion_point.insert_before(s)

    # Output path
    out_path = os.path.join(lessons_root, topic_name + OUTPUT_SUFFIX)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(str(soup))

    log(f"[INFO] Wrote final HTML: {out_path}")
    return True


def main():
    topic_dirs = find_topic_dirs(LESSONS_ROOT)
    if not topic_dirs:
        log("[ERROR] No topic directories found.")
        sys.exit(1)

    failed = False
    for topic_dir in topic_dirs:
        if not build_topic(topic_dir, LESSONS_ROOT):
            failed = True

    if failed:
        sys.exit(1)


if __name__ == "__main__":
    main()