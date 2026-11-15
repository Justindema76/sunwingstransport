# Builds CSS that re-colours every blue in the site's stylesheets (black / gold / warm neutrals).
# Each rule is re-emitted with only its blue-containing declarations, under a scope prefix.
import re, sys
MAP = {
  '#0b2545':'#111111','#13315c':'#1c1c1c','#1a4a80':'#2a2a2a','#14213d':'#111111','#1a1f2b':'#161616','#33415c':'#3a3a3a',
  '#1f5fa8':'#111111','#e8f1fb':'#FFF5D6','#e6eef8':'#FFF3D0','#d6e4f5':'#F3E3B5','#c9d9ee':'#EAD7A0','#cfe0f5':'#F5E6BC',
  '#cfdcee':'#EEDDAA','#b7c9e0':'#D8D2C6','#a9c2e2':'#CDB777','#c9d6e8':'#E8D9AE','#d5deea':'#E6DCC4','#8a97a8':'#8F897E',
  '#fbfcfe':'#FFFDF7','#f8fafc':'#FFFCF4','#5b6b82':'#5E5A52','#e3e9f2':'#ECE5D3','#f6f8fb':'#FBF8F0',
}
RGBA = [(re.compile(r'rgba\(\s*11\s*,\s*37\s*,\s*69\s*,'),'rgba(0,0,0,'),(re.compile(r'rgba\(\s*31\s*,\s*95\s*,\s*168\s*,'),'rgba(0,0,0,'),(re.compile(r'rgba\(\s*19\s*,\s*49\s*,\s*92\s*,'),'rgba(0,0,0,')]
HEX = re.compile(r'#[0-9a-fA-F]{6}\b')
def conv(v):
  out = HEX.sub(lambda m: MAP.get(m.group(0).lower(), m.group(0)), v)
  for r, rep in RGBA: out = r.sub(rep, out)
  return out
def parse(css, scope):
  css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
  out, i, n = [], 0, len(css)
  def block(start, prefix_media=None):
    nonlocal out
    j = start
    while j < n:
      k = css.find('{', j); e = css.find('}', j)
      if e != -1 and (k == -1 or e < k): return e + 1
      if k == -1: return n
      sel = css[j:k].strip()
      if sel.startswith('@media') or sel.startswith('@supports'):
        inner = []
        save = out; out = inner
        j = block(k + 1)
        out = save
        if inner: out.append(sel + '{' + ''.join(inner) + '}')
        continue
      if sel.startswith('@'):
        depth, m = 1, k + 1
        while depth and m < n:
          if css[m] == '{': depth += 1
          elif css[m] == '}': depth -= 1
          m += 1
        j = m; continue
      e = css.find('}', k)
      decls = css[k + 1:e]
      keep = []
      for d in decls.split(';'):
        if ':' not in d: continue
        p, v = d.split(':', 1)
        if p.strip().startswith('--'): continue
        nv = conv(v)
        if nv != v: keep.append(p.strip() + ':' + nv.strip())
      if keep:
        sels = ','.join(scope + ' ' + s.strip() if not s.strip().startswith(('html','body',':root')) else scope for s in sel.split(','))
        out.append(sels + '{' + ';'.join(keep) + '}')
      j = e + 1
    return n
  block(0)
  return ''.join(out)
scope = sys.argv[1]
css = ''.join(open(f).read() for f in sys.argv[2:])
print(parse(css, scope))
