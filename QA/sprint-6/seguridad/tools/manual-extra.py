from pathlib import Path
import urllib.request,urllib.error,json,subprocess,datetime
r=Path(__file__).resolve().parents[4];out=r/'QA/sprint-6/seguridad/revalidacion';out.mkdir(parents=True,exist_ok=True);tests=[]
def req(path,token=None,method='GET',obj=None,raw=None,extra=None):
 headers={'Content-Type':'application/json',**(extra or {})}
 if token: headers['Authorization']='Bearer '+token
 data=raw if raw is not None else json.dumps(obj).encode() if obj is not None else None
 q=urllib.request.Request('http://127.0.0.1:8081'+path,data=data,headers=headers,method=method)
 try:
  with urllib.request.urlopen(q,timeout=15) as a:return a.status,a.read(),dict(a.headers)
 except urllib.error.HTTPError as e:return e.code,e.read(),dict(e.headers)
def check(name,path,status,**kw):
 s,b,h=req(path,**kw);tests.append({'name':name,'method':kw.get('method','GET'),'path':path,'expected':status,'actual':s});assert s==status,(name,s,b[:200]);return b,h
T={}
for u in ['cliente','cliente2','analista','supervisor','auditor','admin']:
 b,h=check('login '+u,'/api/auth/login',200,method='POST',obj={'correo':u+'@demo.pa','contrasena':'Demo-Tramites-2026'});T[u]=json.loads(b)['token'];assert not any('JSESSIONID' in v for v in h.values())
b,_=check('create synthetic case','/api/expedientes',201,token=T['cliente'],method='POST',obj={'tipoTramite':'PRORROGA_ESTADIA'});case=json.loads(b)['id']
for tail in ['', '/documentos','/historial','/observaciones','/verificaciones']:
 check('IDOR denied '+tail,'/api/expedientes/'+case+tail,404,token=T['cliente2'])
check('BOLA state denied','/api/expedientes/'+case+'/estado',403,token=T['cliente'],method='PATCH',obj={'estadoNuevo':'EN_ANALISIS','motivo':'QA','version':0})
check('IDOR observation denied','/api/expedientes/'+case+'/observaciones',404,token=T['cliente2'],method='POST',obj={'texto':'QA'})
marker='<img src=x onerror=alert("HU28")>'
check('XSS payload stored as text','/api/expedientes/'+case+'/observaciones',201,token=T['analista'],method='POST',obj={'texto':marker})
b,_=check('observation response JSON','/api/expedientes/'+case+'/observaciones',200,token=T['cliente']);assert marker in [x['texto'] for x in json.loads(b)]
b,_=check('notices minimize text','/api/notificaciones',200,token=T['cliente']);assert marker.encode() not in b
check('SQLi invalid enum','/api/expedientes?estado=%27%20OR%201%3D1--',400,token=T['analista'])
b,_=check('malformed JSON','/api/expedientes',400,token=T['cliente'],method='POST',raw=b'{broken');assert b'stackTrace' not in b and b'java.lang' not in b
check('unauthenticated cross-origin state change','/api/expedientes/'+case+'/estado',401,method='PATCH',obj={'estadoNuevo':'EN_ANALISIS','motivo':'QA','version':0},extra={'Origin':'https://example.invalid'})
check('cookie cannot substitute bearer','/api/perfil',401,extra={'Cookie':'JSESSIONID=qa-fake-session'})
# Dedicated fictitious account exercises brute-force protection without blocking scan roles.
for i in range(6): check('failed login '+str(i+1),'/api/auth/login',401,method='POST',obj={'correo':'recepcion@demo.pa','contrasena':'incorrecta-qa'})
check('blocked account rejects correct password','/api/auth/login',401,method='POST',obj={'correo':'recepcion@demo.pa','contrasena':'Demo-Tramites-2026'})
logs=subprocess.check_output(['docker','compose','-p','hu28validacion','logs','--no-color','backend'],cwd=r).decode()
assert marker not in logs
for token in T.values():assert token not in logs
for email in ['cliente@demo.pa','cliente2@demo.pa','analista@demo.pa']: assert email not in logs
(out/'manual-extra.json').write_text(json.dumps({'date':datetime.datetime.now(datetime.timezone.utc).isoformat(),'tests':tests,'log_redaction':'No session tokens, test account emails or XSS marker in backend logs','xss_limit':'Stored JSON checked; browser execution must be checked separately.'},indent=2))
print('EXTRA PASS',len(tests))
