"""Streaming parser for a phpMyAdmin MySQL dump.

Yields (table, [values...]) row tuples without loading the whole file.
Handles multi-row extended INSERTs and MySQL string escaping.
"""
import re
import sys

INSERT_RE = re.compile(r"^INSERT INTO `([^`]+)` \(([^)]*)\) VALUES")
UNESCAPE = {
    "0": "\0", "b": "\b", "n": "\n", "r": "\r",
    "t": "\t", "Z": "\x1a", "\\": "\\", "'": "'", '"': '"',
}


def split_row(s):
    """Split one `(...)` tuple body into python values."""
    out, i, n = [], 0, len(s)
    while i < n:
        while i < n and s[i] in " \t":
            i += 1
        if i >= n:
            break
        if s[i] == "'":
            i += 1
            buf = []
            while i < n:
                c = s[i]
                if c == "\\" and i + 1 < n:
                    buf.append(UNESCAPE.get(s[i + 1], s[i + 1]))
                    i += 2
                elif c == "'":
                    if i + 1 < n and s[i + 1] == "'":
                        buf.append("'")
                        i += 2
                    else:
                        i += 1
                        break
                else:
                    buf.append(c)
                    i += 1
            out.append("".join(buf))
        else:
            j = i
            while j < n and s[j] != ",":
                j += 1
            tok = s[i:j].strip()
            out.append(None if tok.upper() == "NULL" else tok)
            i = j
        while i < n and s[i] in " \t":
            i += 1
        if i < n and s[i] == ",":
            i += 1
    return out


def iter_rows(path, tables=None):
    """Yield (table, columns, values) for every INSERT row."""
    table = cols = None
    buf = ""
    with open(path, "r", encoding="utf-8", errors="replace") as fh:
        for line in fh:
            if buf == "":
                m = INSERT_RE.match(line)
                if m:
                    table = m.group(1)
                    cols = [c.strip(" `") for c in m.group(2).split(",")]
                    rest = line[m.end():]
                    if tables and table not in tables:
                        table = None
                        continue
                    buf = rest
                    line = ""
                elif table is None:
                    continue
            if table is None:
                continue
            buf += line
            # A statement ends with ");" at end of a line.
            stripped = buf.rstrip()
            if not stripped.endswith(";"):
                continue
            body = stripped[:-1]
            for raw in split_tuples(body):
                yield table, cols, split_row(raw)
            buf = ""
            table = None


def split_tuples(body):
    """Split `(a,b),(c,d)` into the inner text of each tuple."""
    depth, i, n, start = 0, 0, len(body), None
    in_str = False
    while i < n:
        c = body[i]
        if in_str:
            if c == "\\":
                i += 2
                continue
            if c == "'":
                in_str = False
        elif c == "'":
            in_str = True
        elif c == "(":
            if depth == 0:
                start = i + 1
            depth += 1
        elif c == ")":
            depth -= 1
            if depth == 0:
                yield body[start:i]
        i += 1


if __name__ == "__main__":
    from collections import Counter
    path = sys.argv[1]
    c = Counter()
    mime = Counter()
    for table, cols, vals in iter_rows(path, tables={"ynrh_posts"}):
        r = dict(zip(cols, vals))
        c[(r.get("post_type"), r.get("post_status"))] += 1
        if r.get("post_type") == "attachment":
            mime[r.get("post_mime_type")] += 1
    for (t, s), n in sorted(c.items(), key=lambda kv: -kv[1]):
        print(f"{n:7d}  {t:25s} {s}")
    print("--- attachment mime types ---")
    for m, n in mime.most_common(10):
        print(f"{n:7d}  {m}")
