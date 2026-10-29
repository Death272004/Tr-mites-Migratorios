from pathlib import Path
import urllib.request,urllib.error,json,subprocess,os,time,collections,datetime,traceback
r=Path(__file__).resolve().parents[4]
out=r/'QA/sprint-6/seguridad/revalidacion';out.mkdir(parents=True,exist_ok=True);out.chmod(0o777)
base='http://127.0.0.1:8081'; results=[]
def request(path,token=None,method='GET',data=None):
 h={'Content-Type':'application/json'}
 if token:h['Authorization']='Bearer '+token
 req=urllib.request.Request(base+path,headers=h,method=method,data=json.dumps(data).encode() if data is not None else None)
 try:
  with urllib.request.urlopen(req,timeout=20) as res: return res.status,res.read(),dict(res.headers)
 except urllib.error.HTTPError as e:return e.code,e.read(),dict(e.headers)
def check(name,path,expected,token=None,method='GET',data=None):
 status,body,headers=request(path,token,method,data);results.append({'name':name,'method':method,'path':path,'expected':expected,'actual':status});assert status==expected,(name,status,body[:150]);return body,headers
try:
 (out/'auth-hook.py').write_text((r/'QA/sprint-6/seguridad/tools/auth-hook.py').read_text())
 # Real sessions are held in memory. Reports and console never contain bearer tokens.
 tokens={};roles={}
 for user in ['cliente','cliente2','analista','supervisor','auditor','admin']:
  b,_=check('login '+user,'/api/auth/login',200,method='POST',data={'correo':user+'@demo.pa','contrasena':'Demo-Tramites-2026'})
  d=json.loads(b);tokens[user]=d['token'];roles[user]=d['rol']
  b,_=check('authenticated profile '+user,'/api/perfil',200,tokens[user]);assert json.loads(b)['correo']==user+'@demo.pa'
 check('no token','/api/expedientes',401)
 check('invalid token','/api/expedientes',401,'invalid-test-token')
 for user in ['cliente','analista','supervisor','auditor']:check('permitted list '+user,'/api/expedientes',200,tokens[user])
 check('admin cannot read cases','/api/expedientes',403,tokens['admin'])
 check('analyst cannot read audit','/api/auditoria/eventos',403,tokens['analista'])
 check('auditor audit access','/api/auditoria/eventos',200,tokens['auditor'])
 check('invalid state SQLi rejected','/api/expedientes?estado=%27%20OR%201%3D1--',400,tokens['analista'])
 _,headers=check('security headers','/html/index.html',200)
 for header in ['Content-Security-Policy','X-Frame-Options','X-Content-Type-Options','Permissions-Policy']:
  assert any(k.lower()==header.lower() for k in headers),header
 (out/'manual.json').write_text(json.dumps({'date':datetime.datetime.now(datetime.timezone.utc).isoformat(),'tests':results,'headers':{k:v for k,v in headers.items() if k.lower() in ['content-security-policy','x-frame-options','x-content-type-options','permissions-policy']}},indent=2))
 print('MANUAL PASS',len(results),flush=True)
 # Convert the published spec with the YAML library already present in the scanner image.
 proc=subprocess.run(['docker','run','--rm','-v',str(r)+':/src:ro','ghcr.io/zaproxy/zaproxy:stable','python','-c',"import yaml,json;print(json.dumps(yaml.safe_load(open('/src/Backend/docs/openapi.yaml'))))"],capture_output=True,text=True,check=True)
 spec=json.loads(proc.stdout)
 for user in ['cliente','analista','supervisor','auditor','admin']:
  role=roles[user];selected={}
  for path,ops in spec['paths'].items():
   op=ops.get('get')
   if not op or '{' in path:continue
   allowed=op.get('x-roles',[])
   if role in allowed: selected[path]={'get':op}
  assert '/api/perfil' in selected,(role,selected.keys())
  filtered=dict(spec);filtered['paths']=selected;filtered['servers']=[{'url':'http://frontend'}]
  (out/(user+'-openapi.json')).write_text(json.dumps(filtered,indent=2));(out/(user+'-openapi.json')).chmod(0o644)
  before,_=check('session pre scan '+user,'/api/perfil',200,tokens[user])
  opts='-config ascan.maxScanDurationInMins=2 -config ascan.threadPerHost=2'
  env=os.environ.copy();env.update(HU28_BEARER=tokens[user],HU28_ROLE=role,HU28_USER=user)
  cmd=['docker','run','--rm','--network','hu28validacion_default','-e','HU28_BEARER','-e','HU28_ROLE','-e','HU28_USER','-v',str(out)+':/zap/wrk:rw','ghcr.io/zaproxy/zaproxy:stable','zap-api-scan.py','-t',user+'-openapi.json','-f','openapi','-r',user+'.html','-J',user+'.json','-z',opts,'--hook','/zap/wrk/auth-hook.py']
  with (out/(user+'-console.txt')).open('w') as f:p=subprocess.run(cmd,stdout=f,stderr=f,env=env)
  # No token retained in diagnostics even if the scanner prints command options.
  log=out/(user+'-console.txt');log.write_text(log.read_text().replace(tokens[user],'[REDACTED]'))
  check('session post scan '+user,'/api/perfil',200,tokens[user])
  report=out/(user+'.json'); assert report.exists(),('missing report',user,p.returncode)
  d=json.loads(report.read_text());counter=collections.Counter()
  for site in d.get('site',[]):
   for a in site.get('alerts',[]):counter[a.get('riskcode')]+=1
  print('SCAN',user,'exit',p.returncode,'alerts',dict(counter),flush=True)
  if p.returncode not in [0,1,2]:raise RuntimeError('scanner infrastructure error '+user)
 with (out/'frontend-console.txt').open('w') as f:
  p=subprocess.run(['docker','run','--rm','--network','hu28validacion_default','-v',str(out)+':/zap/wrk:rw','ghcr.io/zaproxy/zaproxy:stable','zap-baseline.py','-t','http://frontend/html/index.html','-m','1','-r','frontend.html','-J','frontend.json'],stdout=f,stderr=f)
 (out/'manual.json').write_text(json.dumps({'date':datetime.datetime.now(datetime.timezone.utc).isoformat(),'tests':results},indent=2))
 print('COMPLETE',flush=True)
except Exception:
 (out/'manual.json').write_text(json.dumps({'tests':results},indent=2));traceback.print_exc();raise
