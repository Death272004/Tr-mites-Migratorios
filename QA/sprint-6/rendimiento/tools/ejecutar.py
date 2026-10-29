import subprocess,pathlib,json,time,threading,urllib.request,urllib.error,platform,os
root=pathlib.Path(__import__('os').environ.get('HU29_ROOT',str(pathlib.Path(__file__).resolve().parents[4])))
base=root/'QA/sprint-6/rendimiento'
out=pathlib.Path(os.environ.get('HU29_OUTPUT',str(base/'revalidacion')))
if out.exists(): raise RuntimeError('La salida ya existe; elija HU29_OUTPUT nuevo para conservar la evidencia')
out.mkdir(exist_ok=True)
jmeter=__import__('os').environ.get('JMETER_BIN','jmeter')
def sh(args,**kw): return subprocess.run(args,check=True,**kw)
meta={'commit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(),'date':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'platform':platform.platform(),'cpu_count':os.cpu_count(),'memory':pathlib.Path('/proc/meminfo').read_text().splitlines()[0]}
(out/'entorno.json').write_text(json.dumps(meta,indent=2))
plan=(base/'carga-tramites.jmx').read_text().replace('<stringProp name="Header.value">OK</stringProp>','<stringProp name="Header.value">${__P(ESCENARIO,OK)}</stringProp>')
(out/'carga-revalidacion.jmx').write_text(plan)
sh(['bash',str(base/'preparar-datos.sh'),'http://localhost:8181'],stdout=open(out/'preparacion.txt','w'),stderr=subprocess.STDOUT)
def run(name,clients,staff,duration,scenario='OK'):
 folder=out/name;folder.mkdir(exist_ok=True)
 stop=threading.Event()
 def stats():
  with open(folder/'docker-stats.jsonl','w') as f:
   while not stop.is_set():
    p=subprocess.run(['docker','stats','--no-stream','--format','{{json .}}','hu29validacion-backend-1','hu29validacion-db-1','hu29validacion-frontend-1'],capture_output=True,text=True)
    for line in p.stdout.splitlines():
     f.write(json.dumps({'time':time.time(),'stats':json.loads(line)})+'\n')
    f.flush();stop.wait(3)
 t=threading.Thread(target=stats);t.start()
 try:
  with open(folder/'consola.txt','w') as f:
   sh([jmeter,'-n','-t',str(out/'carga-revalidacion.jmx'),'-l',str(folder/'resultados.jtl'),'-j',str(folder/'jmeter.log'),'-JHOST=localhost','-JPUERTO=8181','-JCLIENTE=carga@demo.pa',f'-JCLIENTES={clients}',f'-JDESPACHO={staff}',f'-JDURACION={duration}','-JRAMPA=20',f'-JESCENARIO={scenario}',f'-JDOCUMENTO={base/"documento-prueba.pdf"}','-Jhttpclient4.reuseconnection=true'],cwd=base,stdout=f,stderr=subprocess.STDOUT)
 finally: stop.set();t.join()
 print(name+' DONE',flush=True)
run('calentamiento',1,0,10)
run('referencia',20,10,120)
run('estres',100,50,120)
run('dependencia-error',20,10,60,'ERROR_TECNICO')
(out/'ejecucion-completa.txt').write_text('JMeter completed; acceptance requires report analysis.\n')
