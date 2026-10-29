import fs from 'fs';
const t = JSON.parse(fs.readFileSync(process.argv[2]));
const col = {}; for (const k of t.color.tokens) col[k.name]=k.value;
const L=h=>{h=h.replace('#','');const c=[0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=0.03928?v/12.92:((v+0.055)/1.055)**2.4);return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]};
const cr=(a,b)=>{const x=L(a),y=L(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05)};
const pairs=[['ink','surface',4.5],['ink','surface-sunken',4.5],['ink','surface-muted',4.5],['ink','surface-reveal',4.5],['ink','hover',4.5],['ink','accent-surface',4.5],['ink','danger-surface',4.5],['ink','warning-surface',4.5],['ink','success-surface',4.5],['ink','encodable',4.5],['ink','confirmed',4.5],
['ink-muted','surface',4.5],['ink-muted','surface-sunken',4.5],['ink-muted','surface-muted',4.5],['ink-muted','surface-reveal',4.5],['ink-subtle','surface',4.5],['ink-subtle','surface-sunken',4.5],
['border-strong','surface',3],['border-strong','surface-sunken',3],['accent','surface',4.5],['accent','surface-sunken',4.5],['accent','accent-surface',4.5],['on-accent','accent',4.5],['focus','surface',3],['focus','surface-sunken',3],['focus','surface-muted',3],
['on-banner','banner',4.5],['on-banner-muted','banner',4.5],['danger','surface',4.5],['danger','danger-surface',4.5],['on-danger','danger',4.5],['warning','surface',4.5],['warning','warning-surface',4.5],['success','surface',4.5],['success','success-surface',4.5],['info','info-surface',4.5],['series-1','surface',3],['series-2','surface',3],['series-3','surface',3],['series-4','surface',3],['danger','banner',0],['banner-alert','banner',3],['banner','banner-alert',4.5],['warning-fill','banner',3],
['legal','surface',4.5],['legal','legal-surface',4.5],['on-legal','legal',4.5],['restricted','surface',4.5],['restricted','restricted-surface',4.5],['on-restricted','restricted',4.5],['consent','surface',4.5],['consent','consent-surface',4.5],['on-consent','consent',4.5],['ink','legal-surface',4.5],['ink','restricted-surface',4.5],['ink','consent-surface',4.5],
['ink','ews-zone-yellow',4.5],['ink','ews-zone-orange',4.5],['ink','ews-zone-red',4.5],['ink','ews-zone-blue',4.5],['ink','ews-zone-purple',4.5]];
for (const th of ['light','dark']) for (const [a,b,m] of pairs){const r=cr(col[a][th],col[b][th]); if(r<m){ console.log('FAIL',th,a,'on',b,r.toFixed(2)); process.exitCode=1; } }
console.log('done');
