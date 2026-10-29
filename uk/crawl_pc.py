import re,html,time,random,csv,os,subprocess,json
UA='PuppyAlertBot/1.0 (+https://puppyalert.eu)'
B='https://www.puppies.co.uk'
FET='fetched_urls.txt'; fetched=set(open(FET).read().split()) if os.path.exists(FET) else set()
def get(u):
    if u in fetched: return None
    d=60
    for a in range(3):
        time.sleep(random.uniform(8,20))
        r=subprocess.run(['curl','-sL','-A',UA,'-m','40','-w','\n%{http_code}',u],capture_output=True,text=True,errors='ignore')
        body,_,code=r.stdout.rpartition('\n')
        if code=='200':
            fetched.add(u); open(FET,'a').write(u+'\n'); return body
        if code in('403','429','503'): print('backoff',code,u,flush=True); time.sleep(d); d*=2; continue
        fetched.add(u); open(FET,'a').write(u+'\n'); return None
    print('skip',u,flush=True); return None
def txt(s):
    t=re.sub(r'<script.*?</script>|<style.*?</style>|<[^>]+>','|',s,flags=re.S);return html.unescape(re.sub(r'\s*\|[\s|]*','|',t))
def after(t,k):
    m=re.search(re.escape(k)+r'\|([^|]+)',t);return m.group(1).strip() if m else ''
F=['source','listing_url','breed','litter_size','puppies_available','availability','age','location','price','breeder_name','breeder_type','breeder_profile','breeder_website','ad_ref','status']
out='puppies.co.uk_listings.csv'; new=not os.path.exists(out)
w=csv.DictWriter(open(out,'a',newline=''),F); new and w.writeheader()
seen_b=set(); stale=0; page=B+'/sale'; n=0
while page and stale<30:
    s=get(page)
    if s is None: break
    ads=sorted(set(re.findall(r'https://www\.puppies\.co\.uk/sale/[^/"]+/[^/"]+/[^"?#]+',s)))
    nx=re.search(r'href="([^"]*sale\?page=(\d+))"[^>]*rel="next"|rel="next"[^>]*href="([^"]*sale\?page=\d+)"',s)
    cur=int(re.search(r'page=(\d+)',page).group(1)) if 'page=' in page else 1
    pages=[int(x) for x in re.findall(r'/sale\?page=(\d+)',s)]
    page=f'{B}/sale?page={cur+1}' if (cur+1) in pages else None
    for u in ads:
        a=get(u)
        if a is None: continue
        n+=1; t=txt(a)
        ld=[json.loads(j) for j in re.findall(r'application/ld\+json">(.*?)</script',a,re.S) if '"Product"' in j]
        ld=ld[0] if ld else {}
        bp=re.findall(r'https://www\.puppies\.co\.uk/breeders/(?!licensed|pedigree)[a-z-]+/[^"/]+',a)
        bp=bp[0] if bp else ''
        name=''; btype=''
        m=re.search(r'WhatsApp Breeder\|([^|]+)\|(?:ID Verified\|)?([^|]*Breeder[^|]*)',t)
        if m: name,btype=m.group(1),m.group(2)
        ext=[x for x in set(re.findall(r'href="(https?://[^"]+)"',a)) if not re.search(r'puppies\.co\.uk|facebook|instagram|x\.com|twitter|google|agriapet|rspca|trustap|youtube|tiktok|apple|schema',x)]
        lm=re.search(r'(\d+) puppies total',t)
        loc=re.search(r'\|Sale\|[^|]+\|([^|]+?) - ',t)
        r=dict(source='puppies.co.uk',listing_url=u,breed=(ld.get('brand') or {}).get('name',''),litter_size=lm.group(1) if lm else '',
          puppies_available=after(t,'Puppies available:'),availability=after(t,'Ready to leave:'),age=after(t,'Age:'),
          location=loc.group(1) if loc else '',price=(ld.get('offers') or {}).get('price',''),breeder_name=name,breeder_type=btype,
          breeder_profile=bp,breeder_website=';'.join(sorted(ext)),ad_ref=after(t,'Ad Reference:'),status=(ld.get('offers') or {}).get('availability','').split('/')[-1])
        w.writerow(r)
        key=bp or name
        if key and key not in seen_b: seen_b.add(key); stale=0
        else: stale+=1
        if stale>=30: break
    print('page',cur,'ads',len(ads),'total',n,'breeders',len(seen_b),flush=True)
print('DONE',n,len(seen_b),'stale' if stale>=30 else 'end',flush=True)
