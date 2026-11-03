import urllib.request,urllib.error,json,time,pathlib
root=pathlib.Path(__import__('os').environ.get('HU29_ROOT',str(pathlib.Path(__file__).resolve().parents[4])))
out=pathlib.Path(__import__('os').environ.get('HU29_OUTPUT',str(root/'QA/sprint-6/rendimiento/revalidacion')))
base='http://localhost:8181'
def req(path,data=None,token=None,scenario=None):
 headers={'Content-Type':'application/json'}
 if token:headers['Authorization']='Bearer '+token
 if scenario:headers['X-Scenario']=scenario
 r=urllib.request.Request(('http://localhost:8180' if path=='/actuator/health' else base)+path,data=None if data is None else json.dumps(data).encode(),headers=headers)
 start=time.perf_counter()
 try:
  with urllib.request.urlopen(r,timeout=20) as res: status=res.status; body=json.load(res)
 except urllib.error.HTTPError as e:status=e.code;body=json.load(e)
 return status,body,round((time.perf_counter()-start)*1000,2)
def login(correo):
 s,b,t=req('/api/auth/login',{'correo':correo,'contrasena':'Demo-Tramites-2026'})
 assert s==200
 return b['token']
client=login('carga@demo.pa');staff=login('analista@demo.pa')
results=[]
for scenario,failure in [('ERROR_TECNICO','ERROR_TECNICO'),('TIMEOUT','TIEMPO_AGOTADO')]:
 s,e,t=req('/api/expedientes',{'tipoTramite':'RESIDENCIA_TEMPORAL'},client);assert s==201
 s,v,lat=req('/api/expedientes/'+e['id']+'/verificaciones',{'fuente':'TE','tipoVerificacion':'IDENTIDAD','modo':'SIMULADO','finalidad':'IDENTIDAD_DEL_TITULAR'},staff,scenario)
 h,b,ht=req('/actuator/health')
 l,items,lt=req('/api/expedientes',token=client)
 passed=s==201 and v.get('estado')=='REINTENTO_PROGRAMADO' and v.get('ultimoFallo')==failure and v.get('resultadoMinimo') is None and h==200 and b.get('status')=='UP' and l==200
 results.append({'scenario':scenario,'http':s,'estado':v.get('estado'),'ultimoFallo':v.get('ultimoFallo'),'resultadoMinimo':v.get('resultadoMinimo'),'latency_ms':lat,'health_http':h,'health':b.get('status'),'listing_http':l,'pass':passed})
fixture=json.loads((root/'Backend/src/main/resources/fixtures/fuentes-simuladas.json').read_text())['personas'][0]
mocks=[]
for scenario in ['OK','ERROR_TECNICO','TIMEOUT']:
 for _ in range(10):
  s,b,t=req('/api/mock/te/personas/'+fixture['tipoDocumento']+'/'+fixture['numeroDocumento'],token=staff,scenario=scenario)
  mocks.append({'scenario':scenario,'http':s,'latency_ms':t})
(out/'dependencia-comprobaciones.json').write_text(json.dumps({'checks':results,'mock_latency_samples':mocks},indent=2))
print(json.dumps(results))
assert all(r['pass'] for r in results)
