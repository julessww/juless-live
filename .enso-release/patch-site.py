from pathlib import Path
import hashlib,json,re,sys
site=Path(sys.argv[1]);module=Path(sys.argv[2]).read_text()
oldjs='ScrollMotion-CGghoTCK.js'
def blob(b):return hashlib.sha1(f'blob {len(b)}\0'.encode()+b).hexdigest()
assert blob((site/'assets'/oldjs).read_bytes())=='88274b32accc04c994031ca6e2d5a532845759de'
html=(site/'index.html').read_text()
csspaths=[site/x.lstrip('/') for x in re.findall(r'href="([^\"]+\.css)"',html)]
csspaths=sorted({p for p in csspaths if '@font-face' in p.read_text() and 'Jules Aeonik' in p.read_text()})
assert len(csspaths)==1
csspath=csspaths[0];css=csspath.read_text()
rules=re.findall(r'@font-face\{[^}]*Jules Aeonik[^}]*\}',css);assert len(rules)==2
for rule in rules:
  assert 'font-display:swap' in rule
  css=css.replace(rule,rule.replace('font-display:swap','font-display:optional'))
css,n=re.subn(r'--font-portfolio:[^;}]+','--font-portfolio:"Jules Aeonik",Arial,sans-serif',css);assert n==1
version=hashlib.sha256((module+css).encode()).hexdigest()[:10]
mapping={oldjs:f'ScrollMotion-stable-{version}.js',csspath.name:f'index-stable-{version}.css'}
originals={p:p.read_text() for p in site.rglob('*') if p.is_file() and '.git' not in p.parts and p.suffix in ['.html','.rsc','.js','.json','.css']}
# Rename JS importers too: existing cached modules must not keep importing the old code.
while True:
  extra={p.name:p.stem+f'-stable-{version}'+p.suffix for p,s in originals.items() if p.suffix=='.js' and p.name not in mapping and any(old in s for old in mapping)}
  if not extra:break
  mapping.update(extra)
changed=[]
for p,s in originals.items():
  if p.name==oldjs:s=module
  elif p==csspath:s=css
  for old,new in mapping.items():s=s.replace(old,new)
  if p.suffix=='.html' and '</head>' in s:
    links=''.join(f'<link rel="preload" href="/fonts/{name}.woff2" as="font" type="font/woff2" crossorigin="anonymous"/>' for name in ['AeonikPro-Regular','AeonikPro-Bold'])
    assert '</head>' in s
    s=s.replace('</head>',links+'</head>',1)
  dest=p.with_name(mapping.get(p.name,p.name))
  if s!=originals[p] or dest!=p:
    dest.write_text(s);changed.append(str(dest.relative_to(site)))
manifest={'version':version,'mapping':mapping,'changed':sorted(changed),'sha256':{p:hashlib.sha256((site/p).read_bytes()).hexdigest() for p in sorted(changed)}}
print(json.dumps(manifest,indent=2))
Path(sys.argv[3]).write_text(json.dumps(manifest,indent=2))
