import csv,json,pathlib,math,statistics,collections,gzip,platform,subprocess
root=pathlib.Path(__import__('os').environ.get('HU29_ROOT',str(pathlib.Path(__file__).resolve().parents[4])))
out=pathlib.Path(__import__('os').environ.get('HU29_OUTPUT',str(root/'QA/sprint-6/rendimiento/revalidacion')))
summary={}
for name in ['calentamiento','referencia','estres','dependencia-error']:
 file=out/name/'resultados.jtl'
 opener=open
 if not file.exists():
  file=file.with_suffix('.jtl.gz');opener=gzip.open
 if not file.exists():continue
 rows=list(csv.DictReader(opener(file,'rt')))
 if not rows:continue
 errors=[r for r in rows if r['success']!='true']
 def stats(rs):
  times=sorted(int(r['elapsed']) for r in rs)
  return {'samples':len(rs),'mean_ms':round(statistics.mean(times),2),'p95_ms':times[math.ceil(.95*len(times))-1],'max_ms':max(times)}
 total=stats(rows)
 seconds=(max(int(r['timeStamp'])+int(r['elapsed']) for r in rows)-min(int(r['timeStamp']) for r in rows))/1000
 total.update(duration_s=round(seconds,3),throughput_rps=round(len(rows)/seconds,2),errors=len(errors),error_pct=round(100*len(errors)/len(rows),5),http_errors=sum(r['responseCode'].isdigit() and int(r['responseCode'])>=400 for r in rows),error_details=dict(collections.Counter(r['label']+' | '+r['responseCode']+' | '+r['responseMessage'] for r in errors)))
 total['operations']={label:stats([r for r in rows if r['label']==label]) for label in sorted(set(r['label'] for r in rows))}
 total['p95_reference_2000ms_pass']=all(op['p95_ms']<=2000 for op in total['operations'].values())
 containers={}
 for line in (out/name/'docker-stats.jsonl').read_text().splitlines():
  d=json.loads(line)['stats'];entry=containers.setdefault(d['Name'],{'cpu_max_pct':0,'memory_samples':[]})
  entry['cpu_max_pct']=max(entry['cpu_max_pct'],float(d['CPUPerc'].rstrip('%')))
  entry['memory_samples'].append(d['MemUsage'])
 for entry in containers.values():
  entry['memory_observed']=sorted(set(entry.pop('memory_samples')))
 total['resources']=containers
 summary[name]=total
(out/'resumen.json').write_text(json.dumps(summary,indent=2,ensure_ascii=False))
print(json.dumps({k:{x:v[x] for x in ['samples','p95_ms','mean_ms','throughput_rps','errors','error_pct','error_details','p95_reference_2000ms_pass']} for k,v in summary.items()},indent=2,ensure_ascii=False))
