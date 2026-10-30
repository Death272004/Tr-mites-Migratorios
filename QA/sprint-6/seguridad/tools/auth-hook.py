import os,json,collections
from pathlib import Path

def verify(zap,phase):
    url='http://frontend/api/perfil'
    zap.core.access_url(url,followredirects=False)
    msgs=zap.core.messages(baseurl=url,start=0,count=10000)
    m=msgs[-1]
    status=int(m['responseHeader'].splitlines()[0].split()[1])
    body=json.loads(m['responseBody']) if status==200 else {}
    assert status==200 and body.get('rol')==os.environ['HU28_ROLE'],('Scanner session not authenticated',status)
    return {'phase':phase,'status':status,'role':body['rol']}

def zap_started(zap,target):
    zap.replacer.add_rule(description='HU28 authenticated session',enabled=True,matchtype='REQ_HEADER',matchregex=False,matchstring='Authorization',replacement='Bearer '+os.environ['HU28_BEARER'])
    state={'proofs':[verify(zap,'before')]}
    Path('/zap/wrk/'+os.environ['HU28_USER']+'-auth-proof.json').write_text(json.dumps(state,indent=2))

def zap_pre_shutdown(zap):
    p=Path('/zap/wrk/'+os.environ['HU28_USER']+'-auth-proof.json')
    state=json.loads(p.read_text());state['proofs'].append(verify(zap,'after'))
    codes=collections.Counter()
    for m in zap.core.messages(baseurl='http://frontend/api/',start=0,count=10000):
        try:codes[m['responseHeader'].splitlines()[0].split()[1]]+=1
        except (IndexError,KeyError): pass
    state['response_codes']=dict(codes)
    p.write_text(json.dumps(state,indent=2))
